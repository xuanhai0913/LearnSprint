import { createConnection } from 'node:net';
import { mkdir, rename, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const running=await new Promise(resolve=>{const s=createConnection({host:'127.0.0.1',port:3001});s.once('connect',()=>{s.destroy();resolve(true)});s.once('error',()=>resolve(false));});
if(running){console.error('Stop pnpm dev before resetting the local demo.');process.exit(1);}
const dir=new URL('../.data/',import.meta.url);
const backup=new URL(`backups/${new Date().toISOString().replaceAll(':','-')}/`,dir);
let moved=0;
for(const name of ['learnsprint.sqlite','learnsprint.sqlite-wal','learnsprint.sqlite-shm']){
 const source=new URL(name,dir);
 try{await access(source)}catch{continue}
 await mkdir(backup,{recursive:true,mode:0o700});
 await rename(source,new URL(name,backup));moved++;
}
console.log(moved?`Session files archived to ${fileURLToPath(backup)}. Restart pnpm dev for an empty notebook.`:'No session data to reset.');
console.log('Model invocation ledger and approval limits were not changed. Browser drafts are separate.');
