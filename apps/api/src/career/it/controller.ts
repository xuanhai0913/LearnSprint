import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { z } from 'zod';
import { ItService } from './service.js';
import { careerOwner } from '../identity.js';
import type { CareerRequest, CareerHttpResponse } from '../identity.js';
import { careerError } from '../errors.js';
const base={requestId:z.uuid(),expectedRevision:z.number().int().min(1).max(1000000)};
const decision=z.object({priority:z.enum(['p1','p2','p3']),assignee:z.enum(['service-desk','network','identity']),action:z.enum(['investigate','workaround','escalate'])}).strict();
const command=z.discriminatedUnion('type',[
  z.object({...base,type:z.literal('read'),ticketId:z.enum(['vpn','access','print'])}).strict(),
  z.object({...base,type:z.literal('save'),decisions:z.record(z.string().regex(/^(vpn|access|print)$/),decision)}).strict(),
  z.object({...base,type:z.enum(['review','incident'])}).strict(),
  z.object({...base,type:z.literal('save_handoff_draft'),note:z.string().max(1500)}).strict(),
  z.object({...base,type:z.literal('handoff'),note:z.string().trim().min(20).max(1500)}).strict(),
]);
function parse<T>(schema:z.ZodType<T>,body:unknown):T{const r=schema.safeParse(body);if(!r.success)careerError(400,'INVALID_INPUT','Check the ticket choices. Handoff notes need 20–1500 characters.');return r.data;}
@Controller('api/career/it')
export class ItController {
  constructor(private readonly service:ItService){}
  @Get('home')home(@Req()req:CareerRequest,@Res({passthrough:true})res:CareerHttpResponse){return this.service.home(careerOwner(req,res));}
  @Get('sessions/:id')get(@Req()req:CareerRequest,@Param('id')id:string){return this.service.workspace(careerOwner(req),parse(z.uuid(),id));}
  @Post('sessions')create(@Req()req:CareerRequest,@Body()body:unknown){return this.service.create(careerOwner(req),parse(z.object({requestId:z.uuid(),sourceId:z.uuid().optional()}).strict(),body));}
  @Post('sessions/:id/commands')command(@Req()req:CareerRequest,@Param('id')id:string,@Body()body:unknown){return this.service.command(careerOwner(req),parse(z.uuid(),id),parse(command,body));}
}
