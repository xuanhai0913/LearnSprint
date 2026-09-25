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
@Module({ controllers: [CareerController, CareerAiController], providers: [CareerAiService, CareerAiLedger, CareerVoiceService, CareerVoiceGateway, CareerContent, CareerActors, CareerCoaching, CareerService, { provide: CareerRepository, useClass: SqliteCareerRepository }] })
export class CareerModule {}
