/** Explicitly created after the learner clicks Start voice; never on component mount. */
export class VoiceAudio {
  private context: AudioContext | null = null;
  private media: MediaStream | null = null;
  private capture: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextPlayback = 0;
  private readonly playing = new Set<AudioBufferSourceNode>();
  private cancelled = false;

  async open(onFrame: (frame: ArrayBuffer) => void): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || !window.isSecureContext) throw new Error('This browser cannot capture live audio here. Open LearnSprint over HTTPS or on localhost in Chrome.');
    const context = new AudioContext({ sampleRate: 16000 });
    this.context = context;
    if (context.sampleRate !== 16000) { this.close(); throw new Error('This audio device cannot supply the required sample rate. Use the direct controls.'); }
    await context.resume();
    if (this.cancelled) throw new Error('Voice start cancelled.');
    const media = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
    if (this.cancelled) { media.getTracks().forEach(track => track.stop()); throw new Error('Voice start cancelled.'); }
    this.media = media;
    await context.audioWorklet.addModule('/powerlab/pcm-worklet.js');
    if (this.cancelled) throw new Error('Voice start cancelled.');
    this.source = context.createMediaStreamSource(media);
    this.capture = new AudioWorkletNode(context, 'powerlab-pcm-capture', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
    this.capture.port.onmessage = event => { if (!this.cancelled && event.data instanceof ArrayBuffer) onFrame(event.data); };
    this.source.connect(this.capture); this.capture.connect(context.destination);
  }

  play(bytes: ArrayBuffer): void {
    const context = this.context;
    if (!context || this.cancelled || bytes.byteLength % 2 !== 0 || bytes.byteLength > 256 * 1024) return;
    if (this.nextPlayback - context.currentTime > 8) throw new Error('Audio playback fell behind. Voice stopped so you can restart with a clear connection.');
    const view = new DataView(bytes);
    const audio = context.createBuffer(1, bytes.byteLength / 2, 24000);
    const samples = audio.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    const source = context.createBufferSource(); source.buffer = audio; source.connect(context.destination);
    this.playing.add(source);
    source.onended = () => { this.playing.delete(source); source.disconnect(); };
    const start = Math.max(context.currentTime + .03, this.nextPlayback);
    source.start(start); this.nextPlayback = start + audio.duration;
  }

  stopPlayback(): void {
    for (const node of this.playing) { try { node.stop(); } catch { /* Already ended. */ } node.disconnect(); }
    this.playing.clear(); this.nextPlayback = 0;
  }

  close(): void {
    this.cancelled = true;
    this.stopPlayback();
    if (this.capture) { this.capture.port.onmessage = null; this.capture.port.close(); this.capture.disconnect(); }
    this.source?.disconnect();
    this.media?.getTracks().forEach(track => track.stop());
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
    this.capture = null; this.source = null; this.media = null; this.context = null;
  }
}
