
export function glassMaps(w, h, r, o = {}) {
  const bezel = o.bezel ?? 18, T = bezel * (o.thick ?? 0.7), zoom = o.zoom ?? 0, L = ((o.light ?? -60) * Math.PI) / 180;
  const Lx = Math.cos(L), Ly = Math.sin(L);
  const N = 128, prof = new Float32Array(N), f = (x) => Math.pow(1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 4), 0.25);
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1), a = Math.max(0, x - 0.002), b = Math.min(1, x + 0.002);
    const slope = ((f(b) - f(a)) / (b - a)) * (T / bezel), t1 = Math.atan(slope), t2 = Math.asin(Math.sin(t1) / 1.5);
    prof[i] = (T * f(x) + T * 0.25) * Math.tan(t1 - t2);
  }
  const n = w * h, VX = new Float32Array(n), VY = new Float32Array(n), SA = new Float32Array(n);
  let maxD = 0.0001;
  const hx = w / 2 - r, hy = h / 2 - r;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = x + 0.5 - w / 2, py = y + 0.5 - h / 2, qx = Math.abs(px) - hx, qy = Math.abs(py) - hy;
    const sdf = Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
    if (sdf > 0) continue;
    const d = -sdf;
    let nx, ny;
    if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy); nx = (qx / l) * Math.sign(px); ny = (qy / l) * Math.sign(py); }
    else if (qx > qy) { nx = Math.sign(px); ny = 0; } else { nx = 0; ny = Math.sign(py); }
    let vx = 0, vy = 0;
    if (d < bezel) { const m = prof[Math.round((d / bezel) * (N - 1))]; vx = -nx * m; vy = -ny * m; }
    if (zoom) { vx -= px * zoom; vy -= py * zoom; }
    const k = y * w + x;
    VX[k] = vx; VY[k] = vy; maxD = Math.max(maxD, Math.hypot(vx, vy));
    if (d < bezel) {
      const lit = Math.pow(Math.abs(nx * Lx + ny * Ly), 1.6);
      SA[k] = ((d < 1.4 ? 0.9 : 0) + Math.exp(-d / (bezel * 0.22)) * 0.38) * (0.18 + 0.82 * lit);
    }
  }
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const cx = c.getContext('2d'), im = cx.createImageData(w, h);
  const sc = document.createElement('canvas'); sc.width = w; sc.height = h;
  const sx = sc.getContext('2d'), sim = sx.createImageData(w, h);
  for (let k = 0; k < n; k++) {
    const i = k * 4;
    im.data[i] = 128 + (VX[k] / maxD) * 127; im.data[i + 1] = 128 + (VY[k] / maxD) * 127; im.data[i + 2] = 128; im.data[i + 3] = 255;
    sim.data[i] = sim.data[i + 1] = sim.data[i + 2] = 255; sim.data[i + 3] = Math.min(255, SA[k] * 255);
  }
  cx.putImageData(im, 0, 0); sx.putImageData(sim, 0, 0);
  return { map: c.toDataURL(), spec: sc.toDataURL(), scale: maxD * 2 };
}

const NS = 'http://www.w3.org/2000/svg';
let defs = null, seq = 0;
const getDefs = () => {
  if (defs && document.body.contains(defs)) return defs;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs); document.body.appendChild(svg);
  return defs;
};

function filterEl(id, w, h, g, o = {}) {
  const f = document.createElementNS(NS, 'filter');
  f.setAttribute('id', id); f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('color-interpolation-filters', 'sRGB');
  f.setAttribute('x', 0); f.setAttribute('y', 0); f.setAttribute('width', w); f.setAttribute('height', h);
  const blur = o.blur ?? 0.6, S = g.scale * (o.strength ?? 1);
  let s = `<feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="b"/><feImage href="${g.map}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>`;
  if (o.aberr) {
    const ch = ['1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0', '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0'];
    [1, 1 + o.aberr, 1 + o.aberr * 2].forEach((m, i) => {
      s += `<feDisplacementMap in="b" in2="m" scale="${S * m}" xChannelSelector="R" yChannelSelector="G" result="d${i}"/><feColorMatrix in="d${i}" type="matrix" values="${ch[i]}" result="c${i}"/>`;
    });
    s += `<feBlend in="c1" in2="c2" mode="screen" result="gb"/><feBlend in="c0" in2="gb" mode="screen"/>`;
  } else s += `<feDisplacementMap in="b" in2="m" scale="${S}" xChannelSelector="R" yChannelSelector="G"/>`;
  f.innerHTML = s;
  return f;
}

const made = new Map();
export function applyGlass(el, w, h, r, opts, fopts = {}) {
  if (!w || !h) return;
  const key = `${w}x${h}x${r}|${JSON.stringify(opts || {})}|${JSON.stringify(fopts)}`;
  let hit = made.get(key);
  const d = getDefs();
  if (!hit || !d.querySelector('#' + hit.id)) {
    const id = `lg${++seq}`;
    const g = glassMaps(w, h, r, opts);
    d.appendChild(filterEl(id, w, h, g, fopts));
    hit = { id, g };
    made.set(key, hit);
  }
  const { id, g } = hit;
  const sp = el.querySelector(':scope > .lg-sp');
  if (sp) sp.style.backgroundImage = `url(${g.spec})`;
  el.style.backdropFilter = `url(#${id}) saturate(${fopts.sat ?? 1.5}) brightness(${fopts.bright ?? 1.04})`;
}

export function removeGlass() {}
