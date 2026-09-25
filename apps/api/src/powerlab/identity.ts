import { createHash, randomBytes } from 'node:crypto';
import { labError } from './errors.js';

export interface LocalRequest { headers: { cookie?: string } }
export interface LocalResponse { setHeader(name: string, value: string): void }
const cookieName = 'learnsprint_powerlab_owner_v1';

/** A local capability; only the hash crosses the controller/domain boundary. */
export function labOwner(req: LocalRequest, res?: LocalResponse): string {
  const cookies = (req.headers.cookie ?? '').split(';').map(part => part.trim());
  let token = cookies.find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!res) labError(401, 'OWNER_REQUIRED', 'Open PowerLab in this browser before continuing. Browser cookies are required to keep your practices together.');
    token = randomBytes(32).toString('hex');
    res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/api/lab; HttpOnly; SameSite=Strict; Max-Age=2592000`);
  }
  return createHash('sha256').update(token).digest('hex');
}
