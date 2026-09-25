import { Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { careerAiDataDir } from './config.js';
import type { CareerAllowance } from './config.js';

export interface CareerInvocation { fingerprint: string; state: string; result: string | null }
@Injectable()
export class CareerAiLedger implements OnApplicationShutdown {
  private readonly db: DatabaseSync;
  constructor() {
    mkdirSync(careerAiDataDir, { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(fileURLToPath(new URL('career-ai-invocations.sqlite', careerAiDataDir)));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS career_ai_batches (id TEXT PRIMARY KEY, settings TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS career_ai_invocations (owner TEXT NOT NULL, id TEXT NOT NULL, batch TEXT NOT NULL,
        session_id TEXT NOT NULL, fingerprint TEXT NOT NULL, state TEXT NOT NULL, started_at TEXT NOT NULL,
        ended_at TEXT, result TEXT, usage TEXT, reason TEXT, PRIMARY KEY(owner,id));
      CREATE INDEX IF NOT EXISTS career_ai_invocations_batch ON career_ai_invocations(batch);`);
  }
  get(owner: string, id: string): CareerInvocation | undefined {
    return this.db.prepare('SELECT fingerprint,state,result FROM career_ai_invocations WHERE owner=? AND id=?').get(owner, id) as CareerInvocation | undefined;
  }
  remaining(config: CareerAllowance): number {
    const saved = this.db.prepare('SELECT settings FROM career_ai_batches WHERE id=?').get(config.batchId) as { settings: string } | undefined;
    if (saved && saved.settings !== JSON.stringify(config)) throw new Error('CAREER_AI_BATCH_CHANGED');
    const { count } = this.db.prepare('SELECT COUNT(*) AS count FROM career_ai_invocations WHERE batch=?').get(config.batchId) as { count: number };
    return Math.max(0, Math.min(config.maxInvocations, Math.floor((config.budgetUsd + 1e-9) / config.reserveUsd)) - count);
  }
  reserve(owner: string, id: string, sessionId: string, fingerprint: string, config: CareerAllowance): void {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (this.remaining(config) < 1) throw new Error('CAREER_AI_BUDGET_EXHAUSTED');
      this.db.prepare('INSERT OR IGNORE INTO career_ai_batches VALUES (?,?)').run(config.batchId, JSON.stringify(config));
      this.db.prepare('INSERT INTO career_ai_invocations(owner,id,batch,session_id,fingerprint,state,started_at) VALUES (?,?,?,?,?,?,?)')
        .run(owner, id, config.batchId, sessionId, fingerprint, 'reserved', new Date().toISOString());
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  usage(owner: string, id: string, usage: unknown): void {
    this.db.prepare('UPDATE career_ai_invocations SET usage=? WHERE owner=? AND id=?').run(JSON.stringify(usage), owner, id);
  }
  complete(owner: string, id: string, result: unknown): void {
    this.db.prepare('UPDATE career_ai_invocations SET state=?,result=?,ended_at=? WHERE owner=? AND id=? AND state=?')
      .run('completed', JSON.stringify(result), new Date().toISOString(), owner, id, 'reserved');
  }
  finish(owner: string, id: string, reason: string): void {
    this.db.prepare('UPDATE career_ai_invocations SET state=?,reason=?,ended_at=? WHERE owner=? AND id=? AND state=?')
      .run('closed_or_uncertain', reason, new Date().toISOString(), owner, id, 'reserved');
  }
  onApplicationShutdown(): void { this.db.close(); }
}
