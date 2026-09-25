import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { z } from 'zod';
import { CareerService } from './service.js';
import { careerOwner } from './identity.js';
import type { CareerRequest, CareerHttpResponse } from './identity.js';
import { careerError } from './errors.js';
const id = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const revision = z.number().int().min(1).max(1000000);
const base = { requestId: z.uuid(), expectedRevision: revision, expectedWorldRevision: revision };
const schema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('save_plan'), plan: z.record(id, z.record(id, z.number().int().min(0).max(10000))).refine(p => Object.keys(p).length <= 10 && Object.values(p).every(row => Object.keys(row).length <= 10)) }).strict(),
  z.object({ ...base, type: z.enum(['confirm_plan', 'handoff']), evaluationId: z.uuid() }).strict(),
  z.object({ ...base, type: z.literal('accept_split'), offerId: z.uuid() }).strict(),
  z.object({ ...base, type: z.literal('ask_actor'), actorId: z.enum(['warehouse', 'customer-b', 'shift-lead']), questionId: z.enum(['stock', 'eta', 'departures', 'commitment', 'split', 'budget', 'handoff', 'escalation']) }).strict(),
  z.object({ ...base, type: z.enum(['apply_proposal', 'undo_proposal']), proposalId: z.uuid() }).strict(),
  z.object({ ...base, type: z.literal('request_help'), evaluationId: z.uuid() }).strict(),
  z.object({ ...base, type: z.enum(['evaluate_plan', 'start_shift', 'ask_split', 'pause', 'resume']) }).strict(),
]);
function parse<T>(s: z.ZodType<T>, input: unknown): T {
  const r = s.safeParse(input);
  if (!r.success) careerError(400, 'INVALID_INPUT', 'Check the action and whole-number quantities. No change was saved.');
  return r.data;
}
@Controller('api/career')
export class CareerController {
  constructor(private readonly service: CareerService) {}
  @Get('home') home(@Req() req: CareerRequest, @Res({ passthrough: true }) res: CareerHttpResponse) { return this.service.home(careerOwner(req, res)); }
  @Get('sessions/:id') workspace(@Req() req: CareerRequest, @Param('id') value: string) { return this.service.workspace(careerOwner(req), parse(z.uuid(), value)); }
  @Post('sessions') create(@Req() req: CareerRequest, @Body() value: unknown) { return this.service.create(careerOwner(req), parse(z.object({ requestId: z.uuid(), packVersion: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/) }).strict(), value)); }
  @Post('sessions/:id/replay') replay(@Req() req: CareerRequest, @Param('id') value: string, @Body() body: unknown) {
    return this.service.startReplay(careerOwner(req), parse(z.uuid(), value), parse(z.object({ ...base, sourceEvaluationId: z.uuid(), packVersion: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/) }).strict(), body));
  }
  @Post('sessions/:id/commands') command(@Req() req: CareerRequest, @Param('id') value: string, @Body() body: unknown) { return this.service.command(careerOwner(req), parse(z.uuid(), value), parse(schema, body)); }
}
