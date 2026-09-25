import { readFileSync } from 'node:fs';
import { request } from 'node:http';

const port = Number(process.env.LEARNSPRINT_PORT ?? 3001);
const hosted = process.env.LEARNSPRINT_DEPLOYMENT === 'preview';
const headers = hosted ? {
  host: new URL(process.env.LEARNSPRINT_PUBLIC_ORIGIN).host,
  'x-learnsprint-proxy': readFileSync(process.env.LEARNSPRINT_PROXY_TOKEN_FILE, 'utf8').trim(),
} : { host: `127.0.0.1:${port}` };
const req = request({ host: '127.0.0.1', port, path: '/healthz', headers, timeout: 3000 }, res => {
  res.resume(); res.on('end', () => { process.exitCode = res.statusCode === 200 ? 0 : 1; });
});
req.on('timeout', () => req.destroy());
req.on('error', () => { process.exitCode = 1; });
req.end();
