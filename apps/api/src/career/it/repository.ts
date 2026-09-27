import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ItShift } from '@learnsprint/contracts';

@Injectable()
export class ItRepository implements OnModuleDestroy {
  private readonly db: DatabaseSync;
  constructor() {
    const dir = process.env.LEARNSPRINT_DATA_DIR ?? fileURLToPath(new URL('../../../../../.data/', import.meta.url));
    mkdirSync(dir,{recursive:true,mode:0o700});
    this.db = new DatabaseSync(join(dir,'it-support.sqlite'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS shifts(id TEXT PRIMARY KEY,owner TEXT NOT NULL,body TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS shifts_owner ON shifts(owner);
      CREATE TABLE IF NOT EXISTS requests(owner TEXT NOT NULL,id TEXT NOT NULL,fingerprint TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(owner,id));`);
  }
  list(owner:string):ItShift[] {return (this.db.prepare('SELECT body FROM shifts WHERE owner=? ORDER BY rowid DESC LIMIT 100').all(owner) as {body:string}[]).map(r=>JSON.parse(r.body));}
  get(owner:string,id:string):ItShift|undefined {const r=this.db.prepare('SELECT body FROM shifts WHERE owner=? AND id=?').get(owner,id) as {body:string}|undefined;return r?JSON.parse(r.body):undefined;}
  replay(owner:string,sourceId:string):ItShift|undefined {const r=this.db.prepare("SELECT body FROM shifts WHERE owner=? AND json_extract(body,'$.sourceId')=? LIMIT 1").get(owner,sourceId) as {body:string}|undefined;return r?JSON.parse(r.body):undefined;}
  save(owner:string,s:ItShift) {this.db.prepare('INSERT INTO shifts VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body WHERE owner=excluded.owner').run(s.id,owner,JSON.stringify(s));}
  request(owner:string,id:string) {return this.db.prepare('SELECT fingerprint,body FROM requests WHERE owner=? AND id=?').get(owner,id) as {fingerprint:string;body:string}|undefined;}
  remember(owner:string,id:string,fingerprint:string,s:ItShift) {this.db.prepare('INSERT INTO requests VALUES(?,?,?,?)').run(owner,id,fingerprint,JSON.stringify(s));}
  transaction<T>(fn:()=>T):T {this.db.exec('BEGIN IMMEDIATE');try {const result=fn();this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}}
  onModuleDestroy(){this.db.close();}
}
