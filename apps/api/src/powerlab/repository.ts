import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { LabActionEvent, LabReceipt, LabRun, LabSession } from '@learnsprint/contracts';

interface RememberedRequest { fingerprint: string; receipt: LabReceipt }
interface JsonRow { body: string }

export abstract class LabRepository {
  abstract list(owner: string): LabSession[];
  abstract get(owner: string, sessionId: string): LabSession | undefined;
  abstract save(owner: string, session: LabSession): void;
  abstract runs(sessionId: string): LabRun[];
  abstract appendRun(run: LabRun): void;
  abstract actions(sessionId: string): LabActionEvent[];
  abstract appendAction(action: LabActionEvent): void;
  abstract request(owner: string, requestId: string): RememberedRequest | undefined;
  abstract remember(owner: string, fingerprint: string, receipt: LabReceipt): void;
  abstract transaction<T>(work: () => T): T;
}

@Injectable()
export class SqliteLabRepository extends LabRepository implements OnModuleDestroy {
  private readonly db: DatabaseSync;

  constructor() {
    super();
    const dir = process.env.LEARNSPRINT_DATA_DIR
      ? pathToFileURL(process.env.LEARNSPRINT_DATA_DIR.replace(/\/$/, '') + '/')
      : new URL('../../../../.data/', import.meta.url);
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(fileURLToPath(new URL('powerlab.sqlite', dir)));
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA busy_timeout=5000;
      PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS lab_sessions (
        id TEXT PRIMARY KEY, owner TEXT NOT NULL, updated TEXT NOT NULL, body TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS lab_sessions_owner ON lab_sessions(owner, updated DESC);
      CREATE TABLE IF NOT EXISTS lab_runs (
        id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES lab_sessions(id),
        number INTEGER NOT NULL, body TEXT NOT NULL, UNIQUE(session_id, number)
      );
      CREATE TABLE IF NOT EXISTS lab_actions (
        id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES lab_sessions(id),
        revision INTEGER NOT NULL, body TEXT NOT NULL, UNIQUE(session_id, revision)
      );
      CREATE TABLE IF NOT EXISTS lab_requests (
        owner TEXT NOT NULL, id TEXT NOT NULL, fingerprint TEXT NOT NULL,
        body TEXT NOT NULL, PRIMARY KEY(owner, id)
      );
    `);
  }

  list(owner: string): LabSession[] {
    return (this.db.prepare('SELECT body FROM lab_sessions WHERE owner=? ORDER BY updated DESC').all(owner) as unknown as JsonRow[])
      .map(row => JSON.parse(row.body) as LabSession);
  }

  get(owner: string, sessionId: string): LabSession | undefined {
    const row = this.db.prepare('SELECT body FROM lab_sessions WHERE owner=? AND id=?').get(owner, sessionId) as JsonRow | undefined;
    return row ? JSON.parse(row.body) as LabSession : undefined;
  }

  save(owner: string, session: LabSession): void {
    this.db.prepare(`INSERT INTO lab_sessions VALUES (?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET updated=excluded.updated, body=excluded.body WHERE owner=excluded.owner`)
      .run(session.sessionId, owner, session.updatedAt, JSON.stringify(session));
  }

  runs(sessionId: string): LabRun[] {
    return (this.db.prepare('SELECT body FROM lab_runs WHERE session_id=? ORDER BY number').all(sessionId) as unknown as JsonRow[])
      .map(row => JSON.parse(row.body) as LabRun);
  }

  appendRun(run: LabRun): void {
    this.db.prepare('INSERT INTO lab_runs VALUES (?,?,?,?)').run(run.runId, run.sessionId, run.number, JSON.stringify(run));
  }

  actions(sessionId: string): LabActionEvent[] {
    return (this.db.prepare('SELECT body FROM lab_actions WHERE session_id=? ORDER BY revision DESC LIMIT 20').all(sessionId) as unknown as JsonRow[])
      .map(row => JSON.parse(row.body) as LabActionEvent).reverse();
  }

  appendAction(action: LabActionEvent): void {
    this.db.prepare('INSERT INTO lab_actions VALUES (?,?,?,?)').run(action.eventId, action.sessionId, action.toRevision, JSON.stringify(action));
  }

  request(owner: string, requestId: string): RememberedRequest | undefined {
    const row = this.db.prepare('SELECT fingerprint, body FROM lab_requests WHERE owner=? AND id=?').get(owner, requestId) as { fingerprint: string; body: string } | undefined;
    return row ? { fingerprint: row.fingerprint, receipt: JSON.parse(row.body) as LabReceipt } : undefined;
  }

  remember(owner: string, fingerprint: string, receipt: LabReceipt): void {
    this.db.prepare('INSERT INTO lab_requests VALUES (?,?,?,?)').run(owner, receipt.requestId, fingerprint, JSON.stringify(receipt));
  }

  transaction<T>(work: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = work();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  onModuleDestroy(): void { this.db.close(); }
}
