import { Module } from '@nestjs/common';
import { LabContentService } from './content.js';
import { LabController } from './controller.js';
import { LabRepository, SqliteLabRepository } from './repository.js';
import { LabService } from './service.js';
import { LabVoiceController } from './voice/controller.js';
import { LabVoiceGateway } from './voice/gateway.js';
import { VoiceLedger } from './voice/ledger.js';
import { LabVoiceService } from './voice/service.js';

@Module({
  controllers: [LabController, LabVoiceController],
  providers: [LabContentService, LabService, { provide: LabRepository, useClass: SqliteLabRepository }, VoiceLedger, LabVoiceService, LabVoiceGateway],
})
export class PowerLabModule {}
