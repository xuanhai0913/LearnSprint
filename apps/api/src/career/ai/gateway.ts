import { Injectable, HttpException } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocket, WebSocketServer } from 'ws';
import { z } from 'zod';
import { careerOwner } from '../identity.js';
import { CareerVoiceService } from './voice.js';
import { requestAllowed } from '../../runtime.js';

const messageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('start'), ticket: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ type: z.enum(['stop', 'mute']) }).strict(),
]);

@Injectable()
export class CareerVoiceGateway implements OnModuleInit, OnModuleDestroy {
  private readonly sockets = new WebSocketServer({ noServer: true, maxPayload: 16384, perMessageDeflate: false });
  private server: Server | null = null;
  constructor(private readonly adapter: HttpAdapterHost, private readonly voice: CareerVoiceService) {}

  onModuleInit(): void {
    this.server = this.adapter.httpAdapter.getHttpServer() as Server;
    this.server.on('upgrade', this.upgrade);
  }

  private upgrade = (request: IncomingMessage, socket: Duplex, head: Buffer): void => {
    if (request.url !== '/api/career/voice') return;
    if (!requestAllowed(request.headers, true) || this.sockets.clients.size >= 8) { socket.destroy(); return; }
    let owner: string;
    try { owner = careerOwner(request); } catch { socket.destroy(); return; }
    this.sockets.handleUpgrade(request, socket, head, ws => {
      let connection: ReturnType<CareerVoiceService['start']> | null = null;
      const firstMessage = setTimeout(() => ws.close(1008, 'Start ticket required'), 5000);
      const send = (data: Parameters<Parameters<CareerVoiceService['start']>[2]>[0]) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        if (ws.bufferedAmount > 256 * 1024) { connection?.stop('output_backpressure'); ws.close(1013, 'Voice connection too slow'); return; }
        ws.send(Buffer.isBuffer(data) ? data : JSON.stringify(data));
        if (!Buffer.isBuffer(data) && data.type === 'closed') ws.close(1000, 'Voice session ended');
      };
      ws.on('message', (data, binary) => {
        try {
          if (binary) {
            if (!connection || !Buffer.isBuffer(data)) { ws.close(1008, 'Voice is not ready'); return; }
            connection.audio(data); return;
          }
          const parsed = messageSchema.safeParse(JSON.parse(data.toString()));
          if (!parsed.success) { ws.close(1008, 'Invalid voice control'); return; }
          const message = parsed.data;
          if (message.type === 'start') {
            if (connection) { ws.close(1008, 'Already started'); return; }
            clearTimeout(firstMessage); connection = this.voice.start(owner, message.ticket, send);
          } else if (message.type === 'stop') { connection?.stop('user_stop'); }
          else if (message.type === 'mute') { connection?.mute(); }
        } catch (error) {
          const body = error instanceof HttpException ? error.getResponse() : null;
          const safe = body && typeof body === 'object' ? body as { code?: string; message?: string } : null;
          send({ type: 'error', code: safe?.code ?? 'VOICE_UNAVAILABLE', message: safe?.message ?? 'Voice could not start. Your saved shift is still available.' });
          ws.close(1008, 'Voice unavailable');
        }
      });
      ws.on('error', () => connection?.stop('client_closed'));
      ws.on('close', () => { clearTimeout(firstMessage); connection?.stop('client_closed'); });
    });
  };

  onModuleDestroy(): void {
    this.server?.off('upgrade', this.upgrade);
    for (const ws of this.sockets.clients) ws.close(1001, 'Server restarting');
    this.sockets.close();
  }
}
