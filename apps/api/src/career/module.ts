import { ItController } from './it/controller.js';
import { ItService } from './it/service.js';
import { ItRepository } from './it/repository.js';
import { CareerMcpController } from './mcp.js';
import { Module } from '@nestjs/common';
import { CareerAiService } from './ai/service.js';
import { CareerAiLedger } from './ai/ledger.js';
import { CareerAiController } from './ai/controller.js';
import { CareerVoiceService } from './ai/voice.js';
import { CareerVoiceGateway } from './ai/gateway.js';
import { CareerContent } from './content.js';
import { CareerController } from './controller.js';
import { CareerService } from './service.js';
import { CareerActors } from './actors.js';
import { CareerCoaching } from './coaching.js';
import { CareerRepository, SqliteCareerRepository } from './repository.js';
@Module({ controllers: [ItController, CareerController, CareerAiController, CareerMcpController], providers: [ItService, ItRepository, CareerAiService, CareerAiLedger, CareerVoiceService, CareerVoiceGateway, CareerContent, CareerActors, CareerCoaching, CareerService, { provide: CareerRepository, useClass: SqliteCareerRepository }] })
export class CareerModule {}
