import { readFileSync } from 'node:fs';
import { timingSafeEqual } from 'node:crypto';

const deployment = process.env.LEARNSPRINT_DEPLOYMENT ?? 'local';
if (!['local', 'preview'].includes(deployment)) throw new Error('Unsupported LEARNSPRINT_DEPLOYMENT');
const hosted = deployment === 'preview';
const port = Number(process.env.LEARNSPRINT_PORT ?? 3001);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid API port');
let publicOrigin: string | null = null;
let proxyToken: Buffer | null = null;
if (hosted) {
  const value = process.env.LEARNSPRINT_PUBLIC_ORIGIN;
  if (!value) throw new Error('Preview requires LEARNSPRINT_PUBLIC_ORIGIN');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.origin !== value || url.username || url.password || !url.hostname.includes('.') || ['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('Preview requires an exact public HTTPS origin without a trailing slash');
  if (!process.env.LEARNSPRINT_DATA_DIR?.startsWith('/')) throw new Error('Preview requires an absolute persistent data directory');
  const secretFile = process.env.LEARNSPRINT_PROXY_TOKEN_FILE;
  if (!secretFile) throw new Error('Preview requires a private authenticated proxy');
  const secret = readFileSync(secretFile, 'utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(secret)) throw new Error('Invalid proxy token file');
  proxyToken = Buffer.from(secret);
  publicOrigin = value;
}

export const runtime = Object.freeze({ hosted, port, publicOrigin, bind: hosted ? '0.0.0.0' : '127.0.0.1', access: hosted ? 'browser-preview' as const : 'browser-local' as const });
type Headers = Record<string, string | string[] | undefined>;
const textHeader = (headers: Headers, name: string): string | undefined => typeof headers[name] === 'string' ? headers[name] as string : undefined;
const localHosts = [`127.0.0.1:${port}`, `localhost:${port}`, '127.0.0.1:5173', 'localhost:5173'];

/** Both HTTP and WebSocket upgrades pass this same deployment boundary. */
export function requestAllowed(headers: Headers, requireOrigin = false): boolean {
  const host = textHeader(headers, 'host'), origin = textHeader(headers, 'origin');
  if (!hosted) return localHosts.includes(host ?? '') && (!requireOrigin && !origin || localHosts.some(h => origin === `http://${h}`));
  const token = Buffer.from(textHeader(headers, 'x-learnsprint-proxy') ?? '');
  if (token.length !== proxyToken!.length || !timingSafeEqual(token, proxyToken!)) return false;
  if (host !== new URL(publicOrigin!).host) return false;
  if (origin ? origin !== publicOrigin : requireOrigin) return false;
  const fetchSite = textHeader(headers, 'sec-fetch-site');
  return fetchSite !== 'cross-site';
}
