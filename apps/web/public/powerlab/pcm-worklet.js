// Original capture processor: 512 samples = 32 ms of 16 kHz mono PCM.
class PowerLabPcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new ArrayBuffer(1024);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) {
      const sample = Math.max(-1, Math.min(1, channel[i]));
      this.view.setInt16(this.offset * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
      this.offset++;
      if (this.offset === 512) {
        this.port.postMessage(this.buffer, [this.buffer]);
        this.buffer = new ArrayBuffer(1024);
        this.view = new DataView(this.buffer);
        this.offset = 0;
      }
    }
    // Outputs are left silent: microphone audio is never fed to the speakers.
    return true;
  }
}
registerProcessor('powerlab-pcm-capture', PowerLabPcmCapture);
