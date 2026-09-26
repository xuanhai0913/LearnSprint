/** Reproducible MCP walkthrough against an existing deployment, not an app server. */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { randomUUID } from 'node:crypto';

const origin = process.env.LEARNSPRINT_MCP_ORIGIN ?? 'https://d2g4a2ezl5lw7r.cloudfront.net';
const url = new URL(origin);
if (url.origin !== origin || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('Use an HTTPS origin or local loopback.');
const bootstrap = await fetch(`${origin}/api/career/home`, { redirect: 'error' });
if (!bootstrap.ok) throw new Error(`Owner bootstrap failed: ${bootstrap.status}`);
const cookie = bootstrap.headers.getSetCookie().find(c => c.startsWith('learnsprint_career_owner_v1='))?.split(';')[0];
if (!cookie) throw new Error('Owner cookie was not issued');
const client = new Client({ name: 'learnsprint-reviewer-demo', version: '1.0.0' });
const transport = new StreamableHTTPClientTransport(new URL(`${origin}/api/career/mcp`), {
  requestInit: { headers: { Origin: origin, Cookie: cookie }, redirect: 'error' },
});
const read = (result: Awaited<ReturnType<Client['callTool']>>) => {
  if (result.isError) throw new Error(JSON.stringify(result.content));
  const content = result.content as { type: string; text?: string }[];
  const text = content.find(c => c.type === 'text')?.text;
  if (!text) throw new Error('Missing tool response');
  return JSON.parse(text);
};
try {
  await client.connect(transport);
  console.log(JSON.stringify({ server: client.getServerVersion(), tools: (await client.listTools()).tools.map(t => t.name) }));
  const home = read(await client.callTool({ name: 'career_home', arguments: {} }));
  // Explicit opt-in: default mode lists capabilities and the public brief only.
  if (process.argv.includes('--open-demo-shift')) {
    const created = read(await client.callTool({ name: 'career_open_shift', arguments: { requestId: randomUUID(), packVersion: home.brief.version } }));
    const session = created.workspace.session;
    const answer = read(await client.callTool({ name: 'career_ask_actor', arguments: {
      sessionId: session.id, requestId: randomUUID(), expectedRevision: session.revision,
      expectedWorldRevision: session.worldRevision, actorId: 'warehouse', questionId: 'stock',
    } }));
    console.log(JSON.stringify({ operation: answer.receipt.operation, sourceAnswer: answer.workspace.session.actorReplies.at(-1), paidInference: false }));
  } else console.log(JSON.stringify({ brief: home.brief, note: 'Pass --open-demo-shift to create one fictional shift and save a warehouse fact receipt.' }));
} finally { await client.close(); }
