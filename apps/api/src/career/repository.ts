import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { CareerReceipt, CareerSession } from '@learnsprint/contracts';

interface Request { fingerprint: string; receipt: CareerReceipt }
interface Row { body: string }
function decodeSession(body: string): CareerSession {
  const session = JSON.parse(body) as CareerSession;
  // Existing local shifts gain an empty conversation log, never fabricated history.
  return { ...session, replay: session.replay ?? null, dialogueVersion: session.dialogueVersion ?? '0.1.0', actorReplies: session.actorReplies ?? [], proposals: session.proposals ?? [], proposalActions: session.proposalActions ?? [],
    coachingVersion: session.coachingVersion ?? '0.1.0', help: session.help ?? [], guidedVoice: session.guidedVoice ?? [],
    attempt: session.attempt ?? { id: session.id, history: 'unknown-before-tracking', mode: 'unknown', startedAt: null, firstHelpAt: null },
    evaluations: session.evaluations.map(e => ({ ...e, assistance: e.assistance ?? null })),
    handoff: session.handoff ? { ...session.handoff, assistance: session.handoff.assistance ?? null } : null,
  };
}
export abstract class CareerRepository {
  abstract list(owner: string): CareerSession[];
  abstract get(owner: string, id: string): CareerSession | undefined;
  abstract save(owner: string, session: CareerSession): void;
  abstract request(owner: string, requestId: string): Request | undefined;
  abstract remember(owner: string, fingerprint: string, receipt: CareerReceipt): void;
  abstract transaction<T>(work: () => T): T;
}

@Injectable()
export class SqliteCareerRepository extends CareerRepository implements OnModuleDestroy {
  private readonly db: DatabaseSync;
  constructor() {
    super();
    const dir = process.env.LEARNSPRINT_DATA_DIR ? pathToFileURL(process.env.LEARNSPRINT_DATA_DIR.replace(/\/$/, '') + '/') : new URL('../../../../.data/', import.meta.url);
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(fileURLToPath(new URL('career.sqlite', dir)));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS career_sessions (id TEXT PRIMARY KEY, owner TEXT NOT NULL, updated TEXT NOT NULL, body TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS career_sessions_owner ON career_sessions(owner,updated DESC);
      CREATE TABLE IF NOT EXISTS career_requests (owner TEXT NOT NULL, id TEXT NOT NULL, fingerprint TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY(owner,id));`);
  }
  list(owner: string): CareerSession[] {
    return (this.db.prepare('SELECT body FROM career_sessions WHERE owner=? ORDER BY updated DESC').all(owner) as unknown as Row[]).map(row => decodeSession(row.body));
  }
  get(owner: string, id: string): CareerSession | undefined {
    const row = this.db.prepare('SELECT body FROM career_sessions WHERE owner=? AND id=?').get(owner, id) as Row | undefined;
    return row ? decodeSession(row.body) : undefined;
  }
  save(owner: string, session: CareerSession): void {
    this.db.prepare('INSERT INTO career_sessions VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET updated=excluded.updated,body=excluded.body WHERE owner=excluded.owner').run(session.id, owner, session.updatedAt, JSON.stringify(session));
  }
  request(owner: string, id: string): Request | undefined {
    const row = this.db.prepare('SELECT fingerprint,body FROM career_requests WHERE owner=? AND id=?').get(owner, id) as (Row & { fingerprint: string }) | undefined;
    return row ? { fingerprint: row.fingerprint, receipt: JSON.parse(row.body) as CareerReceipt } : undefined;
  }
  remember(owner: string, fingerprint: string, receipt: CareerReceipt): void {
    this.db.prepare('INSERT INTO career_requests VALUES(?,?,?,?)').run(owner, receipt.requestId, fingerprint, JSON.stringify(receipt));
  }
  transaction<T>(work: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = work(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  onModuleDestroy(): void { this.db.close(); }
}
