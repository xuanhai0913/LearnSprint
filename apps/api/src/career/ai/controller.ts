import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { careerOwner } from '../identity.js';
import type { CareerRequest } from '../identity.js';
import { careerError } from '../errors.js';
import { CareerAiService } from './service.js';
import { CareerVoiceService } from './voice.js';
const base = { requestId: z.uuid(), expectedRevision: z.number().int().positive(), expectedWorldRevision: z.number().int().positive(), actorId: z.enum(['warehouse', 'customer-b', 'shift-lead']) };
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) careerError(400, 'INVALID_INPUT', 'Choose an actor and provide one short request with the current saved revision.');
  return result.data;
}
@Controller('api/career')
export class CareerAiController {
  constructor(private readonly ai: CareerAiService, private readonly voice: CareerVoiceService) {}
  @Get('ai-status') status(@Req() req: CareerRequest) { careerOwner(req); return this.ai.status(); }
  @Post('sessions/:id/ai-turns') turn(@Req() req: CareerRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.ai.turn(careerOwner(req), parse(z.uuid(), id), parse(z.object({ ...base, text: z.string().trim().min(1).max(500) }).strict(), body));
  }
  @Post('ai-turns/:id/cancel') cancel(@Req() req: CareerRequest, @Param('id') id: string) { return this.ai.cancel(careerOwner(req), parse(z.uuid(), id)); }
  @Post('sessions/:id/coaching-focus') focus(@Req() req: CareerRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.ai.focus(careerOwner(req), parse(z.uuid(), id), parse(z.object({ requestId: base.requestId, expectedRevision: base.expectedRevision, expectedWorldRevision: base.expectedWorldRevision, helpId: z.uuid(), question: z.string().trim().min(1).max(500) }).strict(), body));
  }
  @Post('sessions/:id/voice-ticket') ticket(@Req() req: CareerRequest, @Param('id') id: string, @Body() body: unknown) {
    const input = parse(z.object({ ...base, spokenReplies: z.boolean().default(false) }).strict(), body);
    return this.voice.ticket(careerOwner(req), parse(z.uuid(), id), input.expectedRevision, input.expectedWorldRevision, input.actorId, input.requestId, input.spokenReplies);
  }
}
