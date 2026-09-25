import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { z } from 'zod';
import { labError } from './errors.js';
import { LabService } from './service.js';
import { labOwner as owner } from './identity.js';
import type { LocalRequest, LocalResponse } from './identity.js';
const revision = z.number().int().nonnegative().max(1000000);
const mutation = { requestId: z.uuid(), expectedRevision: revision };
const identifier = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const createSchema = z.object({ requestId: z.uuid(), packVersion: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/), scenarioId: identifier }).strict();
const commandSchema = z.discriminatedUnion('type', [
  z.object({ ...mutation, type: z.literal('save_plan'), schedule: z.record(identifier, z.array(identifier).max(24)).refine(value => Object.keys(value).length <= 8) }).strict(),
  z.object({ ...mutation, type: z.literal('pause') }).strict(),
  z.object({ ...mutation, type: z.literal('resume') }).strict(),
  z.object({ ...mutation, type: z.literal('request_help'), runId: z.uuid() }).strict(),
]);
const runSchema = z.object(mutation).strict();

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) labError(400, 'INVALID_INPUT', 'Check the lesson, device hours and action format. No change was saved.');
  return result.data;
}

@Controller('api/lab')
export class LabController {
  constructor(private readonly service: LabService) {}

  @Get('home')
  home(@Req() req: LocalRequest, @Res({ passthrough: true }) res: LocalResponse) {
    return this.service.home(owner(req, res));
  }

  @Get('sessions/:id')
  workspace(@Req() req: LocalRequest, @Param('id') id: string) {
    return this.service.workspace(owner(req), parse(z.uuid(), id));
  }

  @Post('sessions')
  create(@Req() req: LocalRequest, @Body() body: unknown) {
    return this.service.create(owner(req), parse(createSchema, body));
  }

  @Post('sessions/:id/commands')
  command(@Req() req: LocalRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.service.command(owner(req), parse(z.uuid(), id), parse(commandSchema, body));
  }

  @Post('sessions/:id/runs')
  run(@Req() req: LocalRequest, @Param('id') id: string, @Body() body: unknown) {
    return this.service.run(owner(req), parse(z.uuid(), id), parse(runSchema, body));
  }
}
