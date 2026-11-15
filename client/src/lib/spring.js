export function spring({ damping = 1, response = 0.4, value = 0, onUpdate } = {}) {
  const k = Math.pow((2 * Math.PI) / response, 2);
  const c = (4 * Math.PI * damping) / response;
  const s = { x: value, v: 0, target: value, raf: 0, running: false };
  const step = (prev) => (now) => {
    const dt = Math.min(0.032, (now - prev) / 1000);
    const n = Math.max(1, Math.ceil(dt / 0.004));
    for (let i = 0; i < n; i++) {
      const h = dt / n;
      s.v += (-k * (s.x - s.target) - c * s.v) * h;
      s.x += s.v * h;
    }
    if (Math.abs(s.x - s.target) < 0.01 && Math.abs(s.v) < 0.01) {
      s.x = s.target; s.v = 0; s.running = false;
      onUpdate && onUpdate(s.x, 0);
      return;
    }
    onUpdate && onUpdate(s.x, s.v);
    s.raf = requestAnimationFrame(step(now));
  };
  return {
    get value() { return s.x; },
    get velocity() { return s.v; },
    to(t) {
      s.target = t;
      if (!s.running) { s.running = true; s.raf = requestAnimationFrame(step(performance.now())); }
    },
    set(x) { cancelAnimationFrame(s.raf); s.running = false; s.x = s.target = x; s.v = 0; onUpdate && onUpdate(x, 0); },
    stop() { cancelAnimationFrame(s.raf); s.running = false; },
  };
}
