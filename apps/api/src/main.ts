import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module, Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { StudyController } from './study/controller.js';
import { StudyService } from './study/service.js';
import { ContentService } from './study/content.js';
import { SessionRepository, SqliteSessionRepository } from './study/repository.js';
import { AssessmentProvider } from './study/assessment.js';
import { createAssessmentProvider } from './bedrock/config.js';
import { PowerLabModule } from './powerlab/module.js';
import { CareerModule } from './career/module.js';
import { requestAllowed, runtime } from './runtime.js';
@Catch()
class SafeErrors implements ExceptionFilter {
  catch(error:unknown,host:ArgumentsHost){
    const response=host.switchToHttp().getResponse();
    const bodyError=error as {type?:string};
    const status=error instanceof HttpException?error.getStatus():bodyError?.type==='entity.too.large'?413:bodyError?.type==='entity.parse.failed'?400:500;
    const detail=error instanceof HttpException?error.getResponse():null;
    const safe=typeof detail==='object'&&detail!==null&&'code' in detail?detail:status<500?{code:'INVALID_INPUT',message:'The request could not be accepted. Check its path, format and size.',retryable:false}:{code:'PERSISTENCE_FAILED',message:'The operation could not be completed. Your draft is still available; retry with the same request.',retryable:true};
    response.status(status).json({...safe,requestId:randomUUID()});
  }
}
@Module({imports:[PowerLabModule,CareerModule],controllers:[StudyController],providers:[StudyService,ContentService,{provide:SessionRepository,useClass:SqliteSessionRepository},{provide:AssessmentProvider,useFactory:createAssessmentProvider}]})
class AppModule{}
@Module({imports:[CareerModule]})
class CareerPreviewModule{}
const app=await NestFactory.create<NestExpressApplication>(runtime.hosted?CareerPreviewModule:AppModule,{logger:['error','warn','log'],bodyParser:false});
app.disable('x-powered-by');
app.use((req:{headers:Record<string,string|undefined>;method:string;path:string},res:{status:(n:number)=>{json:(v:unknown)=>void};setHeader:(k:string,v:string)=>void},next:()=>void)=>{
  if(!requestAllowed(req.headers,runtime.hosted&&req.method==='POST')){
    res.status(403).json({code:'FORBIDDEN',message:'Access this demo through its configured entry address.',retryable:false});return;
  }
  if(runtime.hosted&&!(req.path==='/'||req.path==='/career'||req.path==='/career/'||req.path==='/healthz'||req.path.startsWith('/api/career/')||req.path.startsWith('/assets/')||req.path==='/powerlab/pcm-worklet.js')){
    res.status(404).json({code:'NOT_FOUND',message:'This route is unavailable in the career demo.',retryable:false});return;
  }
  if(req.method==='POST'&&!req.headers['content-type']?.startsWith('application/json')){res.status(415).json({code:'INVALID_INPUT',message:'JSON is required.',retryable:false});return;}
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  if(runtime.hosted){
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' "+runtime.publicOrigin!.replace('https:','wss:')+"; media-src 'self' blob:; worker-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    res.setHeader('Permissions-Policy','microphone=(self), camera=(), geolocation=()');
  }
  next();
});
app.useBodyParser('json',{limit:'16kb'});
app.useGlobalFilters(new SafeErrors());
app.enableShutdownHooks();
app.getHttpAdapter().get('/healthz',(_req:unknown,res:{json:(v:unknown)=>void})=>res.json({status:'ready'}));
if(runtime.hosted)app.getHttpAdapter().get('/',(_req:unknown,res:{redirect:(n:number,path:string)=>void})=>res.redirect(302,'/career'));
const webDist=fileURLToPath(new URL('../../web/dist/',import.meta.url));
if(existsSync(webDist)){
  app.useStaticAssets(webDist);
  const index=fileURLToPath(new URL('../../web/dist/index.html',import.meta.url));
  // Only known app routes receive the SPA document; missing API/assets stay 404.
  for(const route of runtime.hosted?['/career','/career/']:['/career','/career/','/powerlab','/powerlab/','/mission-preview','/mission-preview/']){
    app.getHttpAdapter().get(route,(_req:unknown,res:{sendFile:(path:string)=>void})=>res.sendFile(index));
  }
}
await app.listen(runtime.port,runtime.bind);
