import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const tag = process.argv[2];
if (!tag || !/^[a-z0-9][a-z0-9-]{3,60}$/.test(tag)) throw new Error('Usage: node scripts/package-preview.mjs <release-tag>');
const output = resolve(root, 'release', `learnsprint-${tag}.tar.gz`);
await mkdir(resolve(root, 'release'), { recursive: true, mode: 0o700 });
// Only release inputs. Never package the local data directory or credential/config files.
const inputs = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'Dockerfile', '.dockerignore',
  'apps/api/package.json', 'apps/api/tsconfig.json', 'apps/api/src',
  'apps/web/package.json', 'apps/web/tsconfig.json', 'apps/web/vite.config.ts', 'apps/web/index.html', 'apps/web/src', 'apps/web/public',
  'packages/contracts', 'content', 'deploy/Caddyfile', 'deploy/Caddyfile.cloudfront', 'deploy/gateway-start.sh', 'deploy/compose.preview.yaml',
  'deploy/healthcheck.mjs', 'deploy/.env.example', 'deploy/career-ai.disabled.json', 'deploy/bootstrap-ubuntu.sh', 'deploy/README.md'];
const archive = spawnSync('tar', ['-czf', output, '--exclude=node_modules', '--exclude=dist', '--exclude=*.tsbuildinfo', '--exclude=.DS_Store', ...inputs], { cwd: root, stdio: 'inherit' });
if (archive.status !== 0) throw new Error('Release archive failed');
const sha256 = createHash('sha256').update(await readFile(output)).digest('hex');
await writeFile(`${output}.sha256`, `${sha256}  ${basename(output)}\n`, { mode: 0o600 });
await writeFile(`${output}.json`, JSON.stringify({ tag, sha256, inputs, createdAt: new Date().toISOString(),
  state: 'source-package-only', containerBuilt: false, deployed: false }, null, 2) + '\n', { mode: 0o600 });
console.log(`Source archive: ${relative(root, output)}\nSHA-256: ${sha256}\nContainer/runtime acceptance and deployment remain pending.`);
