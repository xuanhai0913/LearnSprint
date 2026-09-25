import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import type { Session } from '@learnsprint/contracts';
export abstract class SessionRepository {
  abstract list():Session[];
  abstract get(id:string):Session | undefined;
  abstract save(session:Session):void;
  abstract transaction<T>(work:()=>T):T;
  abstract request(id:string):{fingerprint:string;sessionId:string} | undefined;
  abstract remember(id:string,fingerprint:string,sessionId:string):void;
}
@Injectable()
export class SqliteSessionRepository extends SessionRepository implements OnModuleDestroy {
  private readonly db:DatabaseSync;
  constructor(){
    super();
    const dir=process.env.LEARNSPRINT_DATA_DIR ? pathToFileURL(process.env.LEARNSPRINT_DATA_DIR.replace(/\/$/,'')+'/') : new URL('../../../../.data/',import.meta.url);
    mkdirSync(dir,{recursive:true,mode:0o700});
    this.db=new DatabaseSync(fileURLToPath(new URL('learnsprint.sqlite',dir)));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, updated TEXT NOT NULL, body TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, session_id TEXT NOT NULL);`);
  }
  list(){return (this.db.prepare('SELECT body FROM sessions ORDER BY updated DESC LIMIT 30').all() as {body:string}[]).map(r=>JSON.parse(r.body) as Session);}
  get(id:string){const row=this.db.prepare('SELECT body FROM sessions WHERE id=?').get(id) as {body:string}|undefined;return row?JSON.parse(row.body) as Session:undefined;}
  save(s:Session){this.db.prepare('INSERT INTO sessions VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET updated=excluded.updated,body=excluded.body').run(s.sessionId,s.updatedAt,JSON.stringify(s));}
  request(id:string){return this.db.prepare('SELECT fingerprint,session_id as sessionId FROM requests WHERE id=?').get(id) as {fingerprint:string;sessionId:string}|undefined;}
  remember(id:string,fingerprint:string,sessionId:string){this.db.prepare('INSERT INTO requests VALUES (?,?,?)').run(id,fingerprint,sessionId);}
  transaction<T>(work:()=>T):T {this.db.exec('BEGIN IMMEDIATE');try{const result=work();this.db.exec('COMMIT');return result;}catch(error){this.db.exec('ROLLBACK');throw error;}}
  onModuleDestroy(){this.db.close();}
}
