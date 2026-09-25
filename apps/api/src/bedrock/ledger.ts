import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import type { ModelAssessment } from './contract.js';

/** Counts every reserved attempt, including uncertain failures, against its approval batch. */
export class InvocationLedger {
  private readonly db: DatabaseSync;
  constructor() {
    const dir = process.env.LEARNSPRINT_DATA_DIR ? pathToFileURL(process.env.LEARNSPRINT_DATA_DIR.replace(/\/$/,'')+'/') : new URL('../../../../.data/', import.meta.url);
    mkdirSync(dir, {recursive: true, mode: 0o700});
    this.db = new DatabaseSync(fileURLToPath(new URL('model-invocations.sqlite', dir)));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS approval_batches (id TEXT PRIMARY KEY, call_limit INTEGER NOT NULL, budget_usd REAL NOT NULL, reserve_usd REAL NOT NULL);
      CREATE TABLE IF NOT EXISTS invocations (
        request_id TEXT PRIMARY KEY, batch TEXT NOT NULL, fingerprint TEXT NOT NULL,
        state TEXT NOT NULL, result TEXT, input_tokens INTEGER, output_tokens INTEGER,
        created_at TEXT NOT NULL
      );`);
  }
  reserve(requestId: string, batch: string, fingerprint: string, limit: number, budgetUsd: number, reserveUsd: number): ModelAssessment | null {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const approval=this.db.prepare('SELECT call_limit,budget_usd,reserve_usd FROM approval_batches WHERE id=?').get(batch) as {call_limit:number;budget_usd:number;reserve_usd:number}|undefined;
      if(approval && (approval.call_limit!==limit || approval.budget_usd!==budgetUsd || approval.reserve_usd!==reserveUsd)) throw new Error('Approval batch settings cannot be changed; obtain a new approval');
      if(!approval)this.db.prepare('INSERT INTO approval_batches VALUES(?,?,?,?)').run(batch,limit,budgetUsd,reserveUsd);
      const old = this.db.prepare('SELECT batch,fingerprint,state,result FROM invocations WHERE request_id=?').get(requestId) as
        {batch:string;fingerprint:string;state:string;result:string|null} | undefined;
      if (old) {
        if (old.batch !== batch || old.fingerprint !== fingerprint) throw new Error('Invocation request conflict');
        if (old.state !== 'complete' || !old.result) throw new Error('Prior invocation is pending or uncertain; automatic retry is disabled');
        this.db.exec('COMMIT');
        return JSON.parse(old.result) as ModelAssessment;
      }
      const row = this.db.prepare('SELECT COUNT(*) AS count FROM invocations WHERE batch=?').get(batch) as {count:number};
      if (row.count >= limit || (row.count + 1) * reserveUsd > budgetUsd + 1e-10) throw Object.assign(new Error('Approved invocation limit reached'),{code:'BUDGET_EXHAUSTED'});
      this.db.prepare('INSERT INTO invocations(request_id,batch,fingerprint,state,created_at) VALUES(?,?,?,?,?)')
        .run(requestId,batch,fingerprint,'reserved',new Date().toISOString());
      this.db.exec('COMMIT');
      return null;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  usage(requestId: string, inputTokens: number, outputTokens: number) {
    this.db.prepare('UPDATE invocations SET input_tokens=?,output_tokens=? WHERE request_id=?').run(inputTokens,outputTokens,requestId);
  }
  complete(requestId: string, result: ModelAssessment) {
    this.db.prepare("UPDATE invocations SET state='complete',result=? WHERE request_id=?").run(JSON.stringify(result),requestId);
  }
  close() { this.db.close(); }
}
