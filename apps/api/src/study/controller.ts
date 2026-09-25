import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import { StudyService, fail } from './service.js';
const mutation=z.object({requestId:z.uuid(),expectedRevision:z.number().int().nonnegative()}).strict();
const create=z.object({requestId:z.uuid(),timeBudgetMinutes:z.union([z.literal(5),z.literal(10),z.literal(15)]),focus:z.enum(['access','methods','sessions']).optional()}).strict();
const answer=mutation.extend({questionId:z.string().max(80),text:z.string().trim().min(1).max(4000),fixtureOutcome:z.enum(['correct','partial','incorrect','unable_to_assess']).optional()}).strict();
function parse<T>(schema:z.ZodType<T>,value:unknown):T{const result=schema.safeParse(value);if(!result.success)fail('INVALID_INPUT','Please check the request fields and try again.');return result.data;}
@Controller('api')
export class StudyController {
  constructor(private readonly service:StudyService){}
  @Get('home') home(){return this.service.home();}
  @Get('sessions/:id') get(@Param('id') id:string){return this.service.get(parse(z.uuid(),id));}
  @Post('sessions') create(@Body() body:unknown){return this.service.create(parse(create,body));}
  @Post('sessions/:id/:action') mutate(@Param('id') id:string,@Param('action') action:string,@Body() body:unknown){
    parse(z.uuid(),id);
    if(action==='answers'){const data=parse(answer,body);return this.service.mutate(id,action,data,data);}
    parse(z.enum(['start','pause','resume','complete']),action);
    return this.service.mutate(id,action,parse(mutation,body));
  }
}
