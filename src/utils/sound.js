// WebAudio synthesizer — no asset files needed
let ctx = null;

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const tone = ({ freq = 440, type = 'sine', dur = 0.1, vol = 0.2, slide = 0 }) => {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + dur);
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
};

const noise = ({ dur = 0.3, vol = 0.3 }) => {
  const c = getCtx();
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  src.buffer = buf;
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
};

export const playClick = () => tone({ freq: 880, type: 'square', dur: 0.06, vol: 0.15, slide: 600 });
export const playSuccess = () => {
  tone({ freq: 660, type: 'triangle', dur: 0.08, vol: 0.18 });
  setTimeout(() => tone({ freq: 990, type: 'triangle', dur: 0.1, vol: 0.18 }), 50);
};
export const playError = () => {
  tone({ freq: 200, type: 'sawtooth', dur: 0.4, vol: 0.3, slide: -150 });
  noise({ dur: 0.3, vol: 0.15 });
};
export const playMeltdown = () => {
  tone({ freq: 110, type: 'sawtooth', dur: 1.2, vol: 0.4, slide: -90 });
  noise({ dur: 1.2, vol: 0.4 });
};
export const playStart = () => {
  tone({ freq: 220, type: 'sine', dur: 0.15, vol: 0.2 });
  setTimeout(() => tone({ freq: 440, type: 'sine', dur: 0.15, vol: 0.2 }), 100);
  setTimeout(() => tone({ freq: 880, type: 'sine', dur: 0.25, vol: 0.2 }), 200);
};
export const playWarn = () => tone({ freq: 1200, type: 'square', dur: 0.04, vol: 0.08 });
