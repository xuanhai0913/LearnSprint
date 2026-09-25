import { Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { voiceDataDir } from './config.js';
import type { VoiceSettings } from './config.js';

export { estimateVoiceUsd, parseUsage } from '../../bedrock/sonic-usage.js';
export type { SonicUsage } from '../../bedrock/sonic-usage.js';
import { estimateVoiceUsd } from '../../bedrock/sonic-usage.js';
import type { SonicUsage } from '../../bedrock/sonic-usage.js';

@Injectable()
export class VoiceLedger implements OnApplicationShutdown {
  private readonly db: DatabaseSync;
  constructor() {
    mkdirSync(voiceDataDir, { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(fileURLToPath(new URL('voice-invocations.sqlite', voiceDataDir)));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS voice_batches (id TEXT PRIMARY KEY, settings TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS voice_invocations (
        id TEXT PRIMARY KEY, batch TEXT NOT NULL, session_id TEXT NOT NULL, owner TEXT NOT NULL,
        started_at TEXT NOT NULL, ended_at TEXT, state TEXT NOT NULL, reason TEXT,
        usage TEXT, estimated_usd REAL, input_bytes INTEGER NOT NULL DEFAULT 0,
        output_bytes INTEGER NOT NULL DEFAULT 0, tools INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS voice_invocations_batch ON voice_invocations(batch);`);
  }

  remaining(settings: VoiceSettings): number {
    const saved = this.db.prepare('SELECT settings FROM voice_batches WHERE id=?').get(settings.batchId) as { settings: string } | undefined;
    if (saved && saved.settings !== JSON.stringify(settings)) throw new Error('VOICE_BATCH_CHANGED');
    const row = this.db.prepare('SELECT COUNT(*) as count FROM voice_invocations WHERE batch=?').get(settings.batchId) as { count: number };
    return Math.max(0, Math.min(settings.maxSessions - row.count, Math.floor((settings.budgetUsd + 1e-9) / settings.reservePerSessionUsd) - row.count));
  }

  reserve(id: string, owner: string, sessionId: string, settings: VoiceSettings): void {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (this.remaining(settings) < 1) throw new Error('VOICE_BUDGET_EXHAUSTED');
      this.db.prepare('INSERT OR IGNORE INTO voice_batches VALUES (?,?)').run(settings.batchId, JSON.stringify(settings));
      this.db.prepare('INSERT INTO voice_invocations(id,batch,session_id,owner,started_at,state) VALUES (?,?,?,?,?,?)')
        .run(id, settings.batchId, sessionId, owner, new Date().toISOString(), 'reserved');
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }

  usage(id: string, usage: SonicUsage): void {
    this.db.prepare('UPDATE voice_invocations SET usage=?,estimated_usd=? WHERE id=?').run(JSON.stringify(usage), estimateVoiceUsd(usage), id);
  }

  finish(id: string, reason: string, inputBytes: number, outputBytes: number, tools: number): void {
    this.db.prepare('UPDATE voice_invocations SET ended_at=?,state=?,reason=?,input_bytes=?,output_bytes=?,tools=? WHERE id=? AND ended_at IS NULL')
      .run(new Date().toISOString(), reason === 'user_stop' || reason === 'session_limit' ? 'closed' : 'closed_or_uncertain', reason, inputBytes, outputBytes, tools, id);
  }

  onApplicationShutdown(): void { this.db.close(); }
}
