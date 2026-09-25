import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { labOwner } from '../identity.js';
import type { LocalRequest } from '../identity.js';
import { labError } from '../errors.js';
import { LabVoiceService } from './service.js';

const ticketSchema = z.object({ requestId: z.uuid(), expectedRevision: z.number().int().nonnegative().max(1000000) }).strict();

@Controller('api/lab')
export class LabVoiceController {
  constructor(private readonly voice: LabVoiceService) {}
  @Get('voice-status')
  status(@Req() req: LocalRequest) { labOwner(req); return this.voice.status(); }

  @Post('sessions/:id/voice-ticket')
  ticket(@Req() req: LocalRequest, @Param('id') id: string, @Body() body: unknown) {
    const input = ticketSchema.safeParse(body), sessionId = z.uuid().safeParse(id);
    if (!input.success || !sessionId.success) labError(400, 'INVALID_INPUT', 'A saved practice revision is required to start voice.');
    return this.voice.ticket(labOwner(req), sessionId.data, input.data.expectedRevision, input.data.requestId);
  }
}
