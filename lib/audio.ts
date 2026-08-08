/**
 * Procedural spatial-audio buffers — no binary assets required.
 * Wind / transformer hum / tracking-motor clicks for the facility.
 */

function fillNoise(buffer: AudioBuffer, gain = 1) {
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * gain;
    }
  }
}

/** Broadband noise shaped later by a BiquadFilter in the graph — high-altitude wind. */
export function createWindBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  fillNoise(buffer, 0.55);
  return buffer;
}

/** Low 60Hz-ish hum with odd harmonics — transformer / HVDC trunk. */
export function createHumBuffer(ctx: AudioContext, seconds = 1): AudioBuffer {
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.floor(rate * seconds), rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const t = i / rate;
    data[i] =
      Math.sin(2 * Math.PI * 55 * t) * 0.45 +
      Math.sin(2 * Math.PI * 110 * t) * 0.18 +
      Math.sin(2 * Math.PI * 165 * t) * 0.08;
  }
  return buffer;
}

/** Short click burst — dual-axis tracking motor step. */
export function createClickBuffer(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 0.05);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const t = i / rate;
    const env = Math.exp(-t * 80);
    data[i] =
      (Math.sin(2 * Math.PI * 1200 * t) * 0.4 + (Math.random() * 2 - 1) * 0.3) *
      env;
  }
  return buffer;
}

export function formatTimeLabel(hours: number): string {
  const h = Math.floor(hours) % 24;
  const m = Math.round((hours - Math.floor(hours)) * 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
