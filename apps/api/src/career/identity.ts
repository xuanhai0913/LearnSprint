import { createHash, randomBytes } from 'node:crypto';
import { careerError } from './errors.js';
import { runtime } from '../runtime.js';
export interface CareerRequest { headers: { cookie?: string } }
export interface CareerHttpResponse { setHeader(name: string, value: string): void }
const name = 'learnsprint_career_owner_v1';
export function careerOwner(req: CareerRequest, res?: CareerHttpResponse): string {
  let token = (req.headers.cookie ?? '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!res) careerError(401, 'OWNER_REQUIRED', 'Open the career desk in this browser first. Cookies keep your shifts together.');
    token = randomBytes(32).toString('hex');
    res.setHeader('Set-Cookie', `${name}=${token}; Path=/api/career; HttpOnly; SameSite=Strict; Max-Age=2592000${runtime.hosted ? '; Secure' : ''}`);
  }
  return createHash('sha256').update(token).digest('hex');
}
