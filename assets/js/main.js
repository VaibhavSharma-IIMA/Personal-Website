/* =========================================================
   Vaibhav Sharma · engineer → investor portfolio
   Vanilla JS canvas/SVG animations. No dependencies.
   ========================================================= */

// Shared state. Each pivot reports 0 → 1 as you scroll through it:
// __mix1 (campus → engineering) and __mix2 (engineering → finance).
// __phase = __mix1 + __mix2 runs 0 (campus) → 1 (engineering) → 2 (finance).
window.__mix1 = 0;
window.__mix2 = 0;
window.__phase = 0;
window.__updateMode = (() => {
  const MODES = {
    campus: { brand: '.launch', foot: 'telemetry nominal' },
    eng: { brand: '.o11y', foot: 'all systems operational' },
    fin: { brand: '.capital', foot: 'markets open · long builders' },
  };
  let mode = null;
  return () => {
    window.__phase = window.__mix1 + window.__mix2;
    const m = window.__phase < 0.5 ? 'campus' : window.__phase < 1.5 ? 'eng' : 'fin';
    if (m === mode) return;
    mode = m;
    document.documentElement.setAttribute('data-mode', m);
    const brand = document.getElementById('brand-suffix'), foot = document.getElementById('foot-status');
    if (brand) brand.textContent = MODES[m].brand;
    if (foot) foot.textContent = MODES[m].foot;
    window.dispatchEvent(new Event('modechange'));
  };
})();

/* ---------- Layout variants (preview): ?honors=split|epilogue|chart&beyond=split|epilogue ---------- */
window.__variant = (() => {
  const q = new URLSearchParams(location.search);
  const pick = (k, allowed, dflt) => (allowed.includes(q.get(k)) ? q.get(k) : dflt);
  const v = {
    honors: pick('honors', ['split', 'epilogue', 'chart'], 'split'),
    beyond: pick('beyond', ['split', 'epilogue'], 'split'),
  };
  document.querySelectorAll('[data-variant]').forEach((el) => {
    const [k, val] = el.dataset.variant.split(':');
    el.hidden = v[k] !== val;
  });
  // leadership panel lives in Act I (split) or joins the personal panels in the epilogue
  const tpl = document.getElementById('lead-template');
  const grid = document.getElementById('beyond-grid');
  if (tpl && grid) {
    const panel = tpl.content.firstElementChild.cloneNode(true);
    if (v.beyond === 'split') document.getElementById('lead-slot').appendChild(panel);
    else grid.appendChild(panel);
    grid.classList.toggle('three', grid.children.length === 3);
    grid.classList.toggle('four', grid.children.length === 4);
  }
  // number the visible sections in reading order
  let n = 0;
  document.querySelectorAll('.section-index').forEach((el) => {
    if (el.closest('[hidden]')) return;
    n += 1;
    el.textContent = String(n).padStart(2, '0');
  });
  // a small switcher so variants can be compared side by side
  if (q.has('honors') || q.has('beyond') || q.has('preview')) {
    const link = (h, b, label) => {
      const on = h === v.honors && b === v.beyond;
      return `<a href="?honors=${h}&beyond=${b}"${on ? ' class="on"' : ''}>${label}</a>`;
    };
    const box = document.createElement('div');
    box.className = 'variant-switch';
    box.innerHTML = `<b>preview</b> honors: ${link('split', v.beyond, 'split')}${link('epilogue', v.beyond, 'epilogue')}${link('chart', v.beyond, 'chart only')}`
      + ` · beyond: ${link(v.honors, 'split', 'split')}${link(v.honors, 'epilogue', 'epilogue')}`;
    document.body.appendChild(box);
  }
  return v;
})();

(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  /* ---------- Year ---------- */
  $('year').textContent = new Date().getFullYear();

  /* ---------- Typewriter role ---------- */
  (() => {
    const el = $('typewriter');
    if (!el) return;
    const phrases = [
      'Investment Partner @ Campus Fund',
      'MBA Candidate @ IIM Ahmedabad, Class of 2027',
      'ex-Investment Banking Summer Intern @ Deutsche Bank',
      'ex-Software Engineer @ LinkedIn',
    ];
    // reserve room for the longest phrase so a wrap never pushes the page down mid-animation
    const line = el.parentElement;
    const reserve = () => {
      const probe = line.cloneNode(false);
      probe.removeAttribute('id');
      probe.style.cssText = `position:absolute;visibility:hidden;min-height:0;width:${line.clientWidth}px`;
      probe.textContent = phrases.reduce((a, b) => (b.length > a.length ? b : a)) + '▌';
      line.parentElement.appendChild(probe);
      line.style.minHeight = `${probe.offsetHeight}px`;
      probe.remove();
    };
    reserve();
    window.addEventListener('resize', reserve);
    if (document.fonts) document.fonts.ready.then(reserve);
    if (reduced) { el.textContent = phrases[0]; return; }
    let p = 0, i = 0, deleting = false;
    const tick = () => {
      const full = phrases[p];
      el.textContent = full.slice(0, i);
      if (!deleting && i < full.length) { i++; setTimeout(tick, 55); }
      else if (!deleting && i === full.length) { deleting = true; setTimeout(tick, 1600); }
      else if (deleting && i > 0) { i--; setTimeout(tick, 28); }
      else { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 350); }
    };
    tick();
  })();

  /* ---------- Helper: hi-dpi canvas sizing ---------- */
  const fit = (canvas) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, r.width * dpr);
    canvas.height = Math.max(1, r.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  };
  window.__fit = fit;

  /* ---------- Background: telemetry, then a log stream, then a market tape ---------- */
  (() => {
    const canvas = $('log-stream');
    if (!canvas || reduced) return;
    let ctx, w, h, drops;
    const LEVELS = [
      { t: 'INFO ', k: 0, p: 0.62 },
      { t: 'DEBUG', k: 1, p: 0.2 },
      { t: 'WARN ', k: 2, p: 0.13 },
      { t: 'ERROR', k: 3, p: 0.05 },
    ];
    const PALETTE = {
      dark:  ['#4ade80', '#38bdf8', '#fbbf24', '#f87171'],
      light: ['#157a3c', '#0369a1', '#a86a00', '#c0392b'],
    };
    const TAPE = {
      dark:  { up: '#22c55e', down: '#ef4444', flat: '#ffa31a' },
      light: { up: '#15803d', down: '#c62828', flat: '#a35a00' },
    };
    let theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    window.addEventListener('themechange', () => {
      theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    });
    // campus: a labelled CanSat packet table (illustrative) scrolling under a pinned header
    const TEL = {
      dark:  { head: '#3dff9a', band: 'rgba(61,255,154,0.10)', val: '#3dff9a', dim: 'rgba(61,255,154,0.7)', state: '#38bdf8', chute: '#fbbf24' },
      light: { head: '#0a7a45', band: 'rgba(10,122,69,0.10)', val: '#0a7a45', dim: 'rgba(10,122,69,0.75)', state: '#0369a1', chute: '#a86a00' },
    };
    const TCOLS = [['TEAM', 0], ['MISSION_TIME', 58], ['PKT', 170], ['ALT_m', 218], ['PRESS_hPa', 282], ['TEMP_C', 366], ['VOLT', 430], ['STATE', 482]];
    const TABLE_W = 610, ROW_H = 15;
    // one packet per second over a looping ~5 minute flight
    const packet = (n) => {
      const t = ((n % 300) + 300) % 300;
      let alt, state;
      if (t < 4) { alt = 0; state = 'LAUNCH_WAIT'; }
      else if (t < 22) { alt = 700 * Math.sin(((t - 4) / 18) * Math.PI / 2); state = 'ASCENT'; }
      else if (t < 26) { alt = 700; state = 'APOGEE'; }
      else if (t < 120) { alt = 700 - (t - 26) * 3.2; state = 'DESCENT'; }
      else if (t < 288) { alt = Math.max(0, 400 - (t - 120) * 2.4); state = 'PARACHUTE'; }
      else { alt = 0; state = 'LANDED'; }
      const mm = String(Math.floor(t / 60)).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
      const press = 1013.25 * Math.pow(1 - 2.25577e-5 * alt, 5.25588); // standard atmosphere
      return ['GAGAN', `00:${mm}:${ss}`, String(1000 + (((n % 9000) + 9000) % 9000)), alt.toFixed(1), press.toFixed(1),
        (21 + Math.sin(n * 0.7) * 2.5).toFixed(1), (5.02 - (t / 300) * 0.2).toFixed(2), state];
    };
    let telScroll = 0;
    const drawTelemetry = (alpha) => {
      const P = TEL[theme];
      const top = 96, tiles = Math.max(1, Math.ceil(w / TABLE_W));
      telScroll += 0.35;
      const first = Math.floor(telScroll / ROW_H), off = telScroll % ROW_H;
      ctx.font = '12px "JetBrains Mono", monospace';
      for (let tIdx = 0; tIdx < tiles; tIdx++) {
        const x0 = 16 + tIdx * TABLE_W;
        for (let r = 0; top + 22 + r * ROW_H - off < h + ROW_H; r++) {
          const y = top + 22 + r * ROW_H - off;
          if (y < top + 20) continue;
          const row = packet(first + r + tIdx * 97);
          const fade = Math.max(0.12, Math.min(0.9, 1 - Math.abs(y - h * 0.55) / (h * 0.7)));
          row.forEach((v, i) => {
            ctx.globalAlpha = alpha * fade * 0.6;
            ctx.fillStyle = i === 7 ? (v === 'PARACHUTE' ? P.chute : P.state) : i === 3 ? P.val : P.dim;
            ctx.fillText(v, x0 + TCOLS[i][1], y);
          });
        }
        // pinned header
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = P.band; ctx.fillRect(x0 - 8, top, TABLE_W - 24, 20);
        ctx.font = '600 11px "JetBrains Mono", monospace'; ctx.fillStyle = P.head;
        TCOLS.forEach(([c, x]) => ctx.fillText(c, x0 + x, top + 14));
        ctx.font = '12px "JetBrains Mono", monospace';
      }
      ctx.globalAlpha = 1;
    };
    const SVC = ['events-api', 'ingest', 'router', 'query', 'kafka', 'index', 'traffic', 'emitter'];
    const MSG = ['request handled', 'flush batch', 'ack offset', 'retry backoff',
      'gc pause', 'shard rebalance', 'event emitted', 'rate limited',
      'connection reset', 'cache miss', 'schema validated', 'segment sealed'];
    const SYM = ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'USDINR', 'GOLD', 'BRENT', 'IN10Y', 'VBHV', 'NIFTYIT', 'MIDCAP'];
    const rnd = (a) => a[(Math.random() * a.length) | 0];
    const pickLevel = () => {
      let r = Math.random();
      for (const l of LEVELS) { if ((r -= l.p) <= 0) return l; }
      return LEVELS[0];
    };
    const logLine = () => {
      const l = pickLevel();
      const ts = new Date().toISOString().slice(11, 23);
      return { k: l.k, s: `${ts} ${l.t} [${rnd(SVC)}] ${rnd(MSG)}` };
    };
    const tapeLine = () => {
      const chg = (Math.random() - 0.42) * 3;
      const px = (500 + Math.random() * 24000).toFixed(2);
      const dir = chg > 0.05 ? 'up' : chg < -0.05 ? 'down' : 'flat';
      const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '■';
      return { d: dir, s: `${rnd(SYM).padEnd(9)} ${px.padStart(9)} ${arrow} ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` };
    };
    const line = () => ({ log: logLine(), tape: tapeLine() });
    const setup = () => {
      const d = fit(canvas); ctx = d.ctx; w = d.w; h = d.h;
      const fontH = 15, colW = 250;
      const cols = Math.ceil(w / colW);
      drops = Array.from({ length: cols }, (_, i) => ({
        x: i * colW + 12,
        y: Math.random() * h,
        speed: 0.4 + Math.random() * 0.9,
        fontH,
        lines: Array.from({ length: Math.ceil(h / fontH) + 2 }, line),
      }));
    };
    setup();
    window.addEventListener('resize', setup);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = '13px "JetBrains Mono", monospace';
      const ph = window.__phase;
      const wC = Math.max(0, 1 - ph), wE = Math.max(0, 1 - Math.abs(ph - 1)), wF = Math.max(0, ph - 1);
      if (wC > 0) drawTelemetry(wC);
      for (const col of drops) {
        col.y += col.speed * (1 - wF * 0.5);
        if (col.y > col.fontH) {
          col.y -= col.fontH;
          col.lines.pop();
          col.lines.unshift(line());
        }
        for (let k = 0; k < col.lines.length; k++) {
          const yy = col.y + k * col.fontH;
          if (yy < -col.fontH || yy > h + col.fontH) continue;
          const fade = Math.max(0.08, Math.min(0.9, 1 - Math.abs(yy - h * 0.5) / (h * 0.7)));
          const ln = col.lines[k];
          if (wE > 0) {
            ctx.globalAlpha = fade * wE;
            ctx.fillStyle = PALETTE[theme][ln.log.k];
            ctx.fillText(ln.log.s, col.x, yy);
          }
          if (wF > 0) {
            ctx.globalAlpha = fade * wF;
            ctx.fillStyle = TAPE[theme][ln.tape.d];
            ctx.fillText(ln.tape.s, col.x, yy);
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  /* ---------- Event pipeline visualization ---------- */
  (() => {
    const canvas = $('pipeline');
    if (!canvas || reduced) return;
    let ctx, w, h, nodeR = 13, labelFont = 11, stagger = false;
    const stages = [
      { name: 'producers', color: '#4ade80' },
      { name: 'emitter', color: '#38e1ff' },
      { name: 'kafka', color: '#a78bfa' },
      { name: 'events store', color: '#38e1ff' },
      { name: 'query', color: '#7c5cff' },
    ];
    let nodes = [], packets = [];
    let labelColor = 'rgba(230,236,245,0.72)';
    const readLabelColor = () => {
      const t = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
      labelColor = t || 'rgba(230,236,245,0.72)';
    };
    const setup = () => {
      const d = fit(canvas); ctx = d.ctx; w = d.w; h = d.h;
      const pad = Math.max(30, Math.min(70, w * 0.1));
      const span = (w - pad * 2) / (stages.length - 1);
      nodeR = Math.max(7, Math.min(13, span * 0.26));
      labelFont = Math.max(8, Math.min(11, span / 5.2));
      stagger = span < 82;
      nodes = stages.map((s, i) => ({ ...s, x: pad + i * span, y: h / 2 }));
      packets = [];
    };
    setup();
    readLabelColor();
    window.addEventListener('resize', setup);
    window.addEventListener('themechange', readLabelColor);

    const spawn = () => {
      const isErr = Math.random() < 0.08;
      packets.push({
        seg: 0, t: 0,
        speed: 0.008 + Math.random() * 0.01,
        r: 2.5 + Math.random() * 2,
        color: isErr ? '#f87171' : (Math.random() < 0.4 ? '#a78bfa' : '#4ade80'),
        wob: Math.random() * Math.PI * 2,
      });
    };
    let spawnAcc = 0;
    const draw = (ts) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        ctx.strokeStyle = 'rgba(120,150,200,0.15)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      spawnAcc += 1;
      if (spawnAcc > 6) { spawnAcc = 0; spawn(); if (Math.random() < 0.5) spawn(); }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { p.t = 0; p.seg++; if (p.seg >= nodes.length - 1) { packets.splice(i, 1); continue; } }
        const a = nodes[p.seg], b = nodes[p.seg + 1];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + Math.sin(ts * 0.002 + p.wob) * 10;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      nodes.forEach((n, i) => {
        const pulse = 1 + Math.sin(ts * 0.003 + n.x) * 0.12;
        ctx.beginPath();
        ctx.fillStyle = '#0a0e17';
        ctx.strokeStyle = n.color; ctx.lineWidth = 2;
        ctx.shadowColor = n.color; ctx.shadowBlur = 14;
        ctx.arc(n.x, n.y, nodeR * pulse, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = labelColor;
        ctx.font = `${labelFont}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        const below = !stagger || i % 2 === 0;
        const ly = below ? n.y + nodeR + labelFont + 5 : n.y - nodeR - 8;
        ctx.fillText(n.name, n.x, ly);
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  /* ---------- Live metrics + sparkline (simulated) ---------- */
  (() => {
    const ingest = $('m-ingest'), lat = $('m-latency'), vol = $('m-volume'), err = $('m-errors');
    const spark = $('sparkline');
    if (!ingest) return;
    const fmt = (n) => n.toLocaleString('en-US');
    const base = { ing: 84200, lat: 42, vol: 375, err: 0.02 };
    const jitter = (v, amt) => v + (Math.random() - 0.5) * amt;
    const history = [];
    let sctx, sw, sh;
    const setupSpark = () => { if (!spark || reduced) return; const d = fit(spark); sctx = d.ctx; sw = d.w; sh = d.h; };
    setupSpark();
    window.addEventListener('resize', setupSpark);
    const drawSpark = () => {
      if (!sctx || reduced) return;
      sctx.clearRect(0, 0, sw, sh);
      if (history.length < 2) return;
      const min = Math.min(...history), max = Math.max(...history), range = max - min || 1;
      sctx.beginPath();
      history.forEach((v, i) => {
        const x = (i / (history.length - 1)) * sw;
        const y = sh - ((v - min) / range) * (sh * 0.8) - sh * 0.1;
        i === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
      });
      sctx.strokeStyle = '#38e1ff'; sctx.lineWidth = 1.5; sctx.stroke();
      sctx.lineTo(sw, sh); sctx.lineTo(0, sh); sctx.closePath();
      const g = sctx.createLinearGradient(0, 0, 0, sh);
      g.addColorStop(0, 'rgba(56,225,255,0.25)'); g.addColorStop(1, 'rgba(56,225,255,0)');
      sctx.fillStyle = g; sctx.fill();
    };
    const update = () => {
      base.ing = Math.max(60000, jitter(base.ing, 6000));
      base.lat = Math.max(18, jitter(base.lat, 8));
      base.vol = Math.max(300, jitter(base.vol, 18));
      base.err = Math.max(0, jitter(base.err, 0.02));
      ingest.textContent = fmt(Math.round(base.ing));
      lat.textContent = Math.round(base.lat);
      vol.textContent = Math.round(base.vol);
      err.textContent = base.err.toFixed(2);
      history.push(base.ing);
      if (history.length > 60) history.shift();
      drawSpark();
    };
    update();
    setInterval(update, reduced ? 3000 : 1200);
  })();

  /* ---------- Hero: satellite ground track (decorative) ---------- */
  (() => {
    const canvas = $('groundtrack');
    if (!canvas || reduced) return;
    let ctx, w, h;
    const setup = () => { const d = fit(canvas); ctx = d.ctx; w = d.w; h = d.h; };
    setup();
    window.addEventListener('resize', setup);
    const track = (x) => h / 2 + Math.sin((x / w) * Math.PI * 4 + 0.6) * h * 0.28;
    const GS = { x: 0.62, y: 0.62 }; // ground station position (fractions)
    const draw = (t) => {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      const G = light ? '#0a7a45' : '#3dff9a', S = light ? '#0369a1' : '#38bdf8';
      ctx.clearRect(0, 0, w, h);
      // lat/long grid
      ctx.fillStyle = light ? 'rgba(10,90,60,0.25)' : 'rgba(61,255,154,0.16)';
      for (let x = 12; x < w; x += 24) for (let y = 12; y < h; y += 24) ctx.fillRect(x, y, 1.5, 1.5);
      // predicted track
      ctx.setLineDash([4, 6]); ctx.strokeStyle = light ? 'rgba(10,90,60,0.4)' : 'rgba(61,255,154,0.35)'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) x === 0 ? ctx.moveTo(x, track(x)) : ctx.lineTo(x, track(x));
      ctx.stroke(); ctx.setLineDash([]);
      // satellite position + flown track
      const sx = ((t / 60) % (w + 80)) - 40, sy = track(sx);
      ctx.strokeStyle = G; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = Math.max(0, sx - 160); x <= sx; x += 3) x === Math.max(0, sx - 160) ? ctx.moveTo(x, track(x)) : ctx.lineTo(x, track(x));
      ctx.stroke();
      // ground station and its link when in range
      const gx = GS.x * w, gy = GS.y * h, inRange = Math.hypot(sx - gx, sy - gy) < h * 0.55;
      ctx.fillStyle = S; ctx.beginPath(); ctx.moveTo(gx, gy - 8); ctx.lineTo(gx - 7, gy + 5); ctx.lineTo(gx + 7, gy + 5); ctx.closePath(); ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText('GS', gx, gy + 18);
      if (inRange) {
        ctx.strokeStyle = S; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t / 120); ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(gx, gy - 8); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      // footprint + satellite
      ctx.strokeStyle = G; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = G; ctx.shadowColor = G; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillText(inRange ? 'LINK · RX' : 'NO LINK', sx, sy - 14);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  /* ---------- Hero: simulated CanSat telemetry ---------- */
  (() => {
    const alt = $('t-alt'), vel = $('t-vel'), temp = $('t-temp'), loss = $('t-loss'), spark = $('t-spark');
    if (!alt) return;
    let a = 700, tC = 24, sctx, sw, sh;
    const hist = [];
    const setupSpark = () => { if (!spark || reduced) return; const d = fit(spark); sctx = d.ctx; sw = d.w; sh = d.h; };
    setupSpark();
    window.addEventListener('resize', setupSpark);
    const update = () => {
      const v = 5 + Math.random() * 2; // parachute descent, m/s
      a -= v * 1.2;
      if (a <= 0) a = 700; // next drop
      tC = Math.max(16, Math.min(31, tC + (Math.random() - 0.5) * 0.6));
      alt.textContent = a.toFixed(0);
      vel.textContent = v.toFixed(1);
      temp.textContent = tC.toFixed(1);
      loss.textContent = '0.0';
      hist.push(a); if (hist.length > 60) hist.shift();
      if (!sctx || hist.length < 2) return;
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      sctx.clearRect(0, 0, sw, sh);
      sctx.beginPath();
      hist.forEach((y, i) => { const x = (i / (hist.length - 1)) * sw, yy = sh - (y / 700) * sh * 0.85 - sh * 0.05; i ? sctx.lineTo(x, yy) : sctx.moveTo(x, yy); });
      sctx.strokeStyle = light ? '#0a7a45' : '#3dff9a'; sctx.lineWidth = 1.5; sctx.stroke();
    };
    update();
    setInterval(update, reduced ? 3000 : 1200);
  })();

  /* ---------- Focus card mini-visuals ---------- */
  const miniCanvas = (host) => {
    const c = document.createElement('canvas');
    c.style.width = '100%'; c.style.height = '100%';
    host.appendChild(c);
    return c;
  };

  // Logs: streaming bars
  (() => {
    const host = $('viz-logs'); if (!host || reduced) return;
    const canvas = miniCanvas(host); let ctx, w, h, bars;
    const cols = ['#4ade80', '#38bdf8', '#fbbf24', '#f87171'];
    const setup = () => { const d = fit(canvas); ctx = d.ctx; w = d.w; h = d.h;
      bars = Array.from({ length: 22 }, () => ({ v: Math.random(), c: cols[(Math.random() * cols.length) | 0] })); };
    setup(); window.addEventListener('resize', setup);
    let acc = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (++acc > 8) { acc = 0; bars.shift(); bars.push({ v: Math.random(), c: cols[(Math.random() * cols.length) | 0] }); }
      const bw = w / bars.length;
      bars.forEach((b, i) => {
        const bh = b.v * h * 0.85 + 4;
        ctx.fillStyle = b.c; ctx.globalAlpha = 0.75;
        ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  // Events: producers fan in to one topic, which fans out to consumers
  (() => {
    const host = $('viz-events'); if (!host || reduced) return;
    const canvas = miniCanvas(host); let ctx, w, h, P, T, C;
    const setup = () => {
      const d = fit(canvas); ctx = d.ctx; w = d.w; h = d.h;
      P = [0.2, 0.4, 0.6, 0.8].map((v) => [w * 0.1, h * v]);
      T = [w * 0.5, h * 0.5];
      C = [0.3, 0.7].map((v) => [w * 0.9, h * v]);
    };
    setup(); window.addEventListener('resize', setup);
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(167,139,250,0.22)'; ctx.lineWidth = 1;
      [...P.map((p) => [p, T]), ...C.map((c) => [T, c])].forEach(([a, b]) => {
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      });
      for (let k = 0; k < 8; k++) {
        const ph = ((t / 1400) + k / 8) % 1;
        const [a, b, f] = ph < 0.5 ? [P[k % 4], T, ph * 2] : [T, C[k % 2], (ph - 0.5) * 2];
        ctx.fillStyle = k % 3 ? '#a78bfa' : '#4ade80';
        ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#a78bfa';
      [...P, ...C].forEach((n) => {
        ctx.beginPath(); ctx.fillStyle = '#0a0e17'; ctx.arc(n[0], n[1], 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.fillStyle = '#1a1433'; ctx.lineWidth = 2;
      ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.roundRect(T[0] - 16, T[1] - 10, 32, 20, 4); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineWidth = 1;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  // Reliability: SLO line
  (() => {
    const host = $('viz-rel'); if (!host || reduced) return;
    const canvas = miniCanvas(host); let ctx, w, h;
    const setup = () => { const d = fit(canvas); ctx = d.ctx; w = d.w; h = d.h; };
    setup(); window.addEventListener('resize', setup);
    const pts = Array.from({ length: 40 }, () => 0.5);
    let acc = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (++acc > 4) { acc = 0; pts.shift(); pts.push(Math.max(0.1, Math.min(0.9, pts[pts.length - 1] + (Math.random() - 0.5) * 0.3))); }
      ctx.strokeStyle = 'rgba(248,113,113,0.4)'; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(0, h * 0.25); ctx.lineTo(w, h * 0.25); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      pts.forEach((p, i) => { const x = (i / (pts.length - 1)) * w, y = h - p * h; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.strokeStyle = '#38e1ff'; ctx.lineWidth = 2; ctx.stroke();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  })();

  /* ---------- Stack grid ---------- */
  (() => {
    const grid = $('stack-grid'); if (!grid) return;
    const stack = [
      ['Python', '#4ade80'], ['Go', '#38e1ff'], ['Kafka', '#a78bfa'],
      ['Fluent Bit', '#fb923c'], ['Azure Data Explorer', '#38bdf8'], ['Kusto / KQL', '#38e1ff'],
      ['MySQL', '#fbbf24'],
      ['Couchbase', '#f87171'], ['Gradle', '#94a3b8'], ['GenAI / LLMs', '#4ade80'],
      ['Alerting & dashboards', '#fbbf24'], ['Incident response', '#f87171'],
    ];
    grid.innerHTML = stack.map(([n, c]) =>
      `<div class="stack-item"><span class="sdot" style="background:${c};box-shadow:0 0 8px ${c}"></span>${n}</div>`
    ).join('');
  })();

  /* ---------- Traces: builds, hackathons, competitions ---------- */
  (() => {
    const grid = $('work-grid'); if (!grid) return;
    const tagColor = (t) => ({
      space: '#38e1ff', hackathon: '#4ade80', coding: '#a78bfa', product: '#fbbf24',
    }[t] || '#8a97ad');
    const items = [
      { name: 'cansat-ground-station', owner: 'CanSat 2021', tag: 'space', prize: 'Intl Rank 2 / 200+',
        description: 'I built the ground station from scratch so we could talk to the satellite and its payloads both ways. It had 0% packet loss and received 100% of commands, and multithreading the GUI brought data latency down to 1s. It raised our practical evaluation score by 30%.' },
      { name: 'project-satark', owner: '5G Hackathon · DoT', tag: 'hackathon', prize: '₹1 Lakh · Top 100 / 1K+',
        description: 'Project SATARK was picked as one of the Top 100 use cases, out of 1K+ entries, in the 5G Hackathon run by the Department of Telecommunications.' },
      { name: 'chandigarh-police-hack', owner: 'Chandigarh Police × Infosys', tag: 'hackathon', prize: '2nd · ₹50,000',
        description: 'Came 2nd out of 20+ teams at the hackathon Chandigarh Police ran with Infosys.' },
      { name: 'iace-hackathon', owner: 'NITI Aayog × CSIRO', tag: 'hackathon', prize: 'Top 5 / 1,500+',
        description: 'Made the top 5 at the India-Australia Circular Economy Hackathon, run by Atal Innovation Mission (NITI Aayog) and CSIRO, Australia.' },
      { name: 'wiehack-3.0', owner: 'BVP IEEE', tag: 'hackathon', prize: '1st · ₹10,000',
        description: 'Won first place out of 100+ teams.' },
      { name: 'innovathon-22', owner: 'Lady Hardinge Medical College', tag: 'hackathon', prize: '3rd · ₹4,000',
        description: 'Came 3rd out of 100+ teams at this medical hackathon.' },
      { name: 'cusehacks · apollohacks', owner: 'International', tag: 'hackathon', prize: '$100 × 2',
        description: '"Best Hack for Social Good" out of 200+ at CuseHacks\'21 and "Best Solo Hack" out of 50+ at ApolloHacks\'21.' },
      { name: 'reply-code-challenge', owner: 'Reply · 2021', tag: 'coding', prize: 'India #10 · World #106',
        description: 'A team coding challenge with 2,000+ teams from around the world.' },
    ];
    grid.innerHTML = items.map((r) => `
      <article class="work-card">
        <div class="work-top">
          <span class="work-name">${r.name}</span>
          <span class="work-owner">${r.owner}</span>
        </div>
        <p class="work-desc">${r.description}</p>
        <div class="work-lang"><span class="sdot" style="width:9px;height:9px;border-radius:50%;background:${tagColor(r.tag)}"></span>${r.tag}<span style="margin-left:auto" class="work-prize">${r.prize}</span></div>
      </article>`).join('');
  })();

  /* ---------- Scroll reveal ---------- */
  (() => {
    if (reduced || !('IntersectionObserver' in window)) return;
    const solo = ['.hero-inner', '.pipeline-wrap', '.metrics-bar', '.section-head',
      '.about-copy', '.timeline', '.explorer', '.edu-strip', '.team-strip', '.contact-copy',
      '.termsheet', '.quote', '.holdings-wrap', '.term-bar', '.act-tag'];
    document.querySelectorAll(solo.join(',')).forEach((el) => el.classList.add('reveal'));
    const groups = ['.impact', '.cards', '.stack-grid', '.work-grid', '.beyond-grid', '.tombs', '.edu-grid', '.mission-grid'];
    groups.forEach((sel) => {
      document.querySelectorAll(sel).forEach((g) => {
        [...g.children].forEach((c, i) => {
          c.classList.add('reveal');
          c.style.transitionDelay = `${(i % 8) * 70}ms`;
        });
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((t) => io.observe(t));
  })();

  /* ---------- Hero parallax ---------- */
  (() => {
    if (reduced) return;
    const grid = document.querySelector('.hero-grid');
    if (!grid) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 1000) grid.style.transform = `translateY(${y * 0.18}px)`;
        ticking = false;
      });
    }, { passive: true });
  })();
})();

/* =========================================================
   Experience · career log explorer
   ========================================================= */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const rows = $('log-rows');
  if (!rows) return;

  const CAREER = [
    { ts: 'Jun 2025', yr: 2025, dur: 'exit 0', level: 'EXIT', company: 'LinkedIn', role: 'Handoff',
      tags: [],
      msg: 'Deferred IIM A admit came due; bittersweet goodbye',
      details: [
        'Left after two years of building and running hyperscale platforms to join the PGP at IIM Ahmedabad (2025–27)',
        'Took with me lessons on ownership, engineering and teamwork that reach well beyond tech' ] },
    { ts: 'Jul 2023 → Jun 2025', yr: 2024, dur: '23 mos', level: 'INFO', company: 'LinkedIn', role: 'Software Engineer · Logs platform',
      tags: ['logs'],
      msg: '$1M+/yr saved; 9PB+/day kept real-time',
      details: [
        'Delivered $1M+ in annual savings by migrating 3PB+ of daily log ingestion across Azure regions, single-handedly',
        'Kept log analysis real-time by managing 9PB+ of daily ingestion on the central logs platform',
        'Cut customer impact during incidents by 20% by building 15+ alerts and 10 metrics dashboards for the platform',
        'Gave 3+ knowledge-transfer sessions on migration strategy' ] },
    { ts: 'Jul 2023 → Jun 2025', yr: 2024, dur: '23 mos', level: 'INFO', company: 'LinkedIn', role: 'Software Engineer · Events platform',
      tags: ['events'],
      msg: 'Central events platform, 0 → 300K+ events/day',
      details: [
        'Scaled from 0 to 300K+ daily events for 5+ critical producers by architecting the central events platform from scratch with my team',
        'Identified the features teams needed and the architectural choices that fit how they actually emitted events; pushed for language-specific SDKs',
        'Designed and built the Python emitter library and the API layer, the first library on the platform; its design became the template for the Go version',
        'Led onboarding across producer teams, working directly with their engineers and managers to align on requirements and adoption',
        'Drafted feature proposals for the logs and events platforms; reviewed 13+ proposals and 44+ code changes' ] },
    { ts: 'Jul 2023 → Jun 2025', yr: 2024, dur: '23 mos', level: 'WARN', company: 'LinkedIn', role: 'Software Engineer · Incident response',
      tags: ['reliability'],
      msg: 'Traffic shifts 83% faster; Bravo award ×2',
      details: [
        'Cut inter-datacenter traffic-shift time by 83%, reducing downtime and revenue loss during incidents',
        'Received the Bravo award twice, as the sole recipient among 4 teammates, for work on incident-response capabilities',
        'Shrank the Traffic Tool\'s data-loss window from indefinite to 1 day by migrating its database from Couchbase to MySQL',
        'Made all builds 5x faster, saving 50+ person-hours, by moving product builds from Gradle to native Go',
        'Drafted the proposal and initial code for a full rewrite of the traffic-shift tool; the project later moved to another team in an org restructure',
        'Prototyped a GenAI-driven incident analysis system, projected to cut Mean Time To Detection by 30%',
        'Resolved 20+ critical incidents and 300+ customer queries over 8+ weeks of on-call',
        'Raised test coverage 7x (10% → 80%+) across owned products; shipped 30+ prod releases; mentored 1 new hire and 1 intern' ] },
    { ts: 'May 2022 → Jul 2022', yr: 2022, dur: '3 mos', level: 'DEBUG', company: 'LinkedIn', role: 'Site Reliability Engineering Intern (PPO)',
      tags: ['internship', 'reliability'],
      msg: 'Groups platform: API operational cost -75%',
      details: [
        'Cut API operational costs by 75% through a detailed analysis of the platform\'s read and write operations',
        'Wrote 4+ documents on database read and write costs for mid-tier API endpoints across the Groups platform',
        'Prototyped automation projected to cut the time for API cost analysis across the org by 40%',
        'Converted to a pre-placement offer' ] },
  ];

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const rowHtml = (e, i) => `
    <div class="log-row" data-i="${i}" data-tags="${e.tags.join(' ')}" role="listitem">
      <button class="lr-summary" type="button" aria-expanded="false" aria-controls="lr-det-${i}">
        <span class="lr-ts">${e.ts}</span>
        <span class="lr-lvl lvl-${e.level}">${e.level}</span>
        <span class="lr-svc">${esc(e.company)}</span>
        <span class="lr-msg"><span class="lr-caret" aria-hidden="true">▸</span><span class="role">${esc(e.role)}</span> · ${esc(e.msg)}<span class="lr-dur">${e.dur}</span></span>
      </button>
      <div class="lr-details" id="lr-det-${i}"><ul>${e.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
    </div>`;

  rows.innerHTML = CAREER.map(rowHtml).join('');

  rows.querySelectorAll('.log-row').forEach((r) => {
    const btn = r.querySelector('.lr-summary');
    btn.addEventListener('click', () => {
      const open = r.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  const filters = $('filters');
  const kqlFilter = $('kql-filter');
  const stats = $('query-stats');
  const FILTER_KQL = {
    all: '',
    logs: '\n| where platform == "logs"',
    events: '\n| where platform == "events"',
    reliability: '\n| where tags has "reliability"',
    internship: '\n| where tags has "internship"',
  };
  const applyFilter = (f) => {
    let shown = 0;
    rows.querySelectorAll('.log-row').forEach((r) => {
      const match = f === 'all' || r.dataset.tags.split(' ').includes(f);
      r.style.display = match ? '' : 'none';
      if (match) shown++;
    });
    kqlFilter.textContent = FILTER_KQL[f] || '';
    stats.innerHTML = `<span class="qs-hi">${shown}</span> record${shown === 1 ? '' : 's'} returned · 23 mos full-time + 3 mos intern · scanned ${CAREER.length} records in <span class="qs-hi">${(3 + Math.random() * 4).toFixed(1)}ms</span>`;
  };
  filters.querySelectorAll('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.filter').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.dataset.f);
    });
  });
  applyFilter('all');

  // histogram: detail lines logged per year, oldest -> newest
  const histo = $('histo');
  if (histo) {
    const years = [2022, 2023, 2024, 2025];
    const count = (y) => CAREER.filter((e) => e.yr === y).reduce((n, e) => n + e.details.length, 0);
    const max = Math.max(...years.map(count));
    histo.innerHTML = years.map((y) => {
      const h = Math.max(8, (count(y) / max) * 100);
      return `<div class="histo-bar" style="height:${h}%" title="${y}"></div>`;
    }).join('');
  }
})();

/* =========================================================
   Impact stats: count-up on scroll
   ========================================================= */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wraps = [...document.querySelectorAll('.impact')];
  if (!wraps.length) return;
  const fmt = (v, dec, prefix, suffix) =>
    `${prefix}${dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')}${suffix}`;
  const run = (el) => {
    const target = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const out = el.querySelector('.stat-val');
    if (reduced) { out.textContent = fmt(target, dec, prefix, suffix); return; }
    const dur = 1400, t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      out.textContent = fmt(target * ease(p), dec, prefix, suffix);
      if (p < 1) requestAnimationFrame(step);
      else out.textContent = fmt(target, dec, prefix, suffix);
    };
    requestAnimationFrame(step);
  };
  const stats = wraps.flatMap((w) => [...w.querySelectorAll('.stat')]);
  if (reduced || !('IntersectionObserver' in window)) { stats.forEach(run); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  stats.forEach((s) => io.observe(s));
})();

/* =========================================================
   The pivot: log histogram morphs into a candlestick chart,
   and the whole site switches from engineering to finance mode
   ========================================================= */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const section = $('pivot'), canvas = $('pivot-canvas');
  if (!section || !canvas) return;
  const root = document.documentElement;
  const bar = $('pivot-bar'), readout = $('pivot-readout'), kicker = $('pivot-kicker');

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  // deterministic data so the morph looks the same every visit
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const N = 32;
  let price = 100;
  const data = Array.from({ length: N }, () => {
    const open = price;
    const close = open * (1 + (rand() - 0.4) * 0.07);
    const high = Math.max(open, close) * (1 + rand() * 0.025);
    const low = Math.min(open, close) * (1 - rand() * 0.025);
    price = close;
    return { vol: 0.25 + rand() * 0.7, open, close, high, low };
  });
  window.__pivotVols = data.map((d) => d.vol); // pivot 1 ends on these same bars
  const pMin = Math.min(...data.map((d) => d.low)), pMax = Math.max(...data.map((d) => d.high));

  let ctx, w, h;
  const setup = () => { const d = window.__fit(canvas); ctx = d.ctx; w = d.w; h = d.h; };
  setup();
  window.addEventListener('resize', () => { setup(); draw(lastP); });

  const hexToRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mixHex = (a, b, t) => {
    const A = hexToRgb(a), B = hexToRgb(b);
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
  };

  let lastP = 0;
  const draw = (p) => {
    if (!ctx) return;
    lastP = p;
    const light = root.getAttribute('data-theme') === 'light';
    const UP = light ? '#0a8f4a' : '#00d26a', DN = light ? '#d0302a' : '#ff3b30';
    const BAR = light ? '#0c7597' : '#38e1ff';
    const gridC = p < 0.5
      ? (light ? 'rgba(40,60,100,0.12)' : 'rgba(150,160,180,0.10)')
      : (light ? 'rgba(163,90,0,0.25)' : 'rgba(255,163,26,0.22)');
    ctx.clearRect(0, 0, w, h);
    const padL = 14, padR = 54, padT = 40, padB = 26;
    const cw = (w - padL - padR) / N;
    const yP = (v) => padT + (1 - (v - pMin) / (pMax - pMin)) * (h - padT - padB);
    const base = h - padB;

    // grid
    ctx.strokeStyle = gridC; ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = padT + (g / 4) * (h - padT - padB);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    }
    // right axis labels fade in with the finance look
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    for (let g = 0; g <= 4; g++) {
      const y = padT + (g / 4) * (h - padT - padB);
      const v = lerp(pMax, pMin, g / 4);
      ctx.globalAlpha = 0.3 + 0.5 * smooth(clamp(p * 1.5 - 0.3));
      ctx.fillStyle = light ? '#47536b' : '#8a97ad';
      const label = p < 0.5 ? `${Math.round(lerp(9, 0, g / 4))} PB` : v.toFixed(1);
      ctx.fillText(label, w - padR + 8, y + 3);
    }
    ctx.globalAlpha = 1;

    // chart title, legend and x-axis label crossfade between the two readings
    const k = smooth(clamp((p - 0.4) / 0.2));
    const txt = light ? '#101a2e' : '#e6ecf5', sub = light ? '#47536b' : '#8a97ad';
    const legend = (alpha, title, items, xLabel) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'left';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.fillStyle = txt;
      ctx.fillText(title, padL + 4, 18);
      ctx.font = '10px "JetBrains Mono", monospace';
      let lx = padL + 4;
      items.forEach(([kind, color, label]) => {
        ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
        if (kind === 'line') { ctx.beginPath(); ctx.moveTo(lx, 30); ctx.lineTo(lx + 12, 30); ctx.stroke(); }
        else ctx.fillRect(lx + 2, 25, 8, 10);
        ctx.fillStyle = sub;
        ctx.fillText(label, lx + 17, 34);
        lx += 17 + ctx.measureText(label).width + 16;
      });
      ctx.fillText(xLabel, padL + 4, h - 8);
      ctx.globalAlpha = 1;
    };
    legend(1 - k, 'Daily log volume (PB)', [['bar', light ? '#0c7597' : '#38e1ff', 'one bar = one day of ingestion']], 'days →');
    legend(k, 'VBHV price (illustrative)', [['bar', UP, 'up day'], ['bar', DN, 'down day'], ['line', light ? '#1b1307' : '#ffffff', '5-day average']], 'trading days →');

    data.forEach((d, i) => {
      const q = smooth(clamp((p - 0.12) * 1.6 - (i / N) * 0.5)); // staggered left → right
      const x = padL + i * cw + cw / 2;
      const up = d.close >= d.open;
      const col = mixHex(BAR, up ? UP : DN, q);
      // eng: histogram bar from the floor; fin: candle body
      const eTop = base - d.vol * (h - padT - padB), eBot = base;
      const fTop = yP(Math.max(d.open, d.close)), fBot = Math.max(yP(Math.min(d.open, d.close)), fTop + 2);
      const top = lerp(eTop, fTop, q), bot = lerp(eBot, fBot, q);
      const bw = lerp(cw * 0.78, cw * 0.56, q);
      ctx.fillStyle = col;
      ctx.globalAlpha = lerp(0.45 + 0.55 * d.vol, 1, q);
      ctx.fillRect(x - bw / 2, top, bw, bot - top);
      // wicks grow in
      if (q > 0.02) {
        ctx.globalAlpha = q;
        ctx.strokeStyle = col; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, lerp(top, yP(d.high), q)); ctx.lineTo(x, top);
        ctx.moveTo(x, bot); ctx.lineTo(x, lerp(bot, yP(d.low), q));
        ctx.stroke();
      }
    });
    // moving-average line once candles have formed
    const lineA = smooth(clamp((p - 0.7) / 0.25));
    if (lineA > 0) {
      ctx.globalAlpha = lineA;
      ctx.strokeStyle = light ? '#1b1307' : '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((d, i) => {
        const s = data.slice(Math.max(0, i - 4), i + 1);
        const ma = s.reduce((a, b) => a + b.close, 0) / s.length;
        const x = padL + i * cw + cw / 2;
        i === 0 ? ctx.moveTo(x, yP(ma)) : ctx.lineTo(x, yP(ma));
      });
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const update = () => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = Math.max(1, r.height - vh);
    const p = reduced
      ? (r.top + r.height / 2 < vh / 2 ? 1 : 0)
      : clamp(-r.top / total);
    window.__mix2 = reduced ? p : smooth(clamp((p - 0.3) / 0.4));
    window.__updateMode();
    if (bar) bar.style.width = `${(p * 100).toFixed(1)}%`;
    if (readout) {
      readout.innerHTML = p < 0.5
        ? `mode: <b>engineering</b> · ingest ${(9 * (1 - p)).toFixed(1)} PB/day`
        : `mode: <b>finance</b> · VBHV ▲ ${((p - 0.5) * 2 * 18.4).toFixed(1)}%`;
    }
    if (kicker) kicker.textContent = p < 0.5 ? '$ tail -f /var/log/career' : 'VBHV <Equity> GP <GO>';
    draw(reduced ? 1 : p);
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('themechange', () => draw(lastP));
  update();
})();

/* =========================================================
   Pivot 1: the CanSat flight profile (telemetry packets) drops
   into daily log-volume bars, switching campus → engineering
   ========================================================= */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const section = $('liftoff'), canvas = $('liftoff-canvas');
  if (!section || !canvas) return;
  const root = document.documentElement;
  const bar = $('liftoff-bar'), readout = $('liftoff-readout'), kicker = $('liftoff-kicker');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const vols = window.__pivotVols || Array.from({ length: 32 }, () => 0.5);
  const N = vols.length;
  // illustrative flight: fast climb on the rocket, then a slow parachute descent
  const altAt = (x) => (x < 0.2 ? Math.sin((x / 0.2) * Math.PI / 2) : 1 - Math.pow((x - 0.2) / 0.8, 1.15));
  const hexToRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mixHex = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };

  let ctx, w, h, lastP = 0;
  const setup = () => { const d = window.__fit(canvas); ctx = d.ctx; w = d.w; h = d.h; };
  setup();

  const draw = (p) => {
    if (!ctx) return;
    lastP = p;
    const light = root.getAttribute('data-theme') === 'light';
    const GREEN = light ? '#0a7a45' : '#3dff9a', CYAN = light ? '#0c7597' : '#38e1ff';
    const txt = light ? '#101a2e' : '#e6ecf5', sub = light ? '#47536b' : '#8a97ad';
    ctx.clearRect(0, 0, w, h);
    const padL = 14, padR = 54, padT = 40, padB = 26;
    const cw = (w - padL - padR) / N, base = h - padB, span = h - padT - padB;
    const k = smooth(clamp((p - 0.45) / 0.1));

    ctx.strokeStyle = k < 0.5 ? (light ? 'rgba(10,90,60,0.18)' : 'rgba(61,255,154,0.12)') : (light ? 'rgba(40,60,100,0.12)' : 'rgba(150,160,180,0.10)');
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) { const y = padT + (g / 4) * span; ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke(); }
    ctx.font = '10px "JetBrains Mono", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = sub; ctx.globalAlpha = 0.8;
    for (let g = 0; g <= 4; g++) {
      const y = padT + (g / 4) * span;
      ctx.fillText(p < 0.5 ? `${Math.round(lerp(700, 0, g / 4))} m` : `${Math.round(lerp(9, 0, g / 4))} PB`, w - padR + 8, y + 3);
    }
    ctx.globalAlpha = 1;

    const legend = (alpha, title, items, xLabel) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha; ctx.textAlign = 'left';
      ctx.font = '600 12px "JetBrains Mono", monospace'; ctx.fillStyle = txt; ctx.fillText(title, padL + 4, 18);
      ctx.font = '10px "JetBrains Mono", monospace';
      let lx = padL + 4;
      items.forEach(([kind, color, label]) => {
        ctx.fillStyle = color;
        if (kind === 'dot') { ctx.beginPath(); ctx.arc(lx + 6, 30, 3.5, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(lx + 2, 25, 8, 10);
        ctx.fillStyle = sub; ctx.fillText(label, lx + 17, 34);
        lx += 17 + ctx.measureText(label).width + 16;
      });
      ctx.fillText(xLabel, padL + 4, h - 8);
      ctx.globalAlpha = 1;
    };
    legend(1 - k, 'Altitude (m) · CanSat flight profile (illustrative)', [['dot', GREEN, 'one telemetry packet']], 'mission time →');
    legend(k, 'Daily log volume (PB)', [['bar', CYAN, 'one bar = one day of ingestion']], 'days →');

    // the flight path fades as its packets drop into bars
    const pathA = 1 - smooth(clamp(p * 2.2));
    if (pathA > 0) {
      ctx.globalAlpha = pathA * 0.6; ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i < N; i++) { const x = padL + i * cw + cw / 2, y = base - altAt(i / (N - 1)) * span; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    for (let i = 0; i < N; i++) {
      const q = smooth(clamp((p - 0.12) * 1.6 - (i / N) * 0.5));
      const x = padL + i * cw + cw / 2;
      const yA = base - altAt(i / (N - 1)) * span;
      const col = mixHex(GREEN, CYAN, q);
      const top = lerp(yA, base - vols[i] * span, q), bot = lerp(yA, base, q);
      const bw = lerp(4, cw * 0.78, q);
      ctx.fillStyle = col;
      if (q < 0.05) {
        ctx.shadowColor = col; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(x, yA, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      } else {
        ctx.globalAlpha = lerp(1, 0.45 + 0.55 * vols[i], q);
        ctx.fillRect(x - bw / 2, top, bw, Math.max(3, bot - top));
        ctx.globalAlpha = 1;
      }
    }
  };

  const update = () => {
    const r = section.getBoundingClientRect(), vh = window.innerHeight;
    const p = reduced ? (r.top + r.height / 2 < vh / 2 ? 1 : 0) : clamp(-r.top / Math.max(1, r.height - vh));
    window.__mix1 = reduced ? p : smooth(clamp((p - 0.3) / 0.4));
    window.__updateMode();
    if (bar) bar.style.width = `${(p * 100).toFixed(1)}%`;
    if (readout) {
      readout.innerHTML = p < 0.5
        ? `mode: <b>mission control</b> · ALT ${Math.round(700 * (1 - p * 2))} m`
        : `mode: <b>engineering</b> · ingest ${(9 * (p - 0.5) * 2).toFixed(1)} PB/day`;
    }
    if (kicker) kicker.textContent = p < 0.5 ? 'CANSAT-2021 · DOWNLINK' : '$ tail -f /var/log/linkedin';
    draw(reduced ? 1 : p);
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', () => { setup(); update(); });
  window.addEventListener('themechange', () => draw(lastP));
  update();
})();

/* =========================================================
   Gentle heading snap: when scrolling stops with a heading within
   SNAP_PX of its resting spot under the nav, glide it into place
   ========================================================= */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SNAP_PX = 80;
  const GAP = 16; // space between the nav bar and a snapped heading
  const nav = document.querySelector('.nav');
  const targets = [...document.querySelectorAll('.section-head, .snap-mark')];
  let snapping = false, timer;
  const settle = () => {
    if (snapping) { snapping = false; return; }
    const line = nav.getBoundingClientRect().height + (GAP);
    let best = null;
    targets.forEach((t) => {
      if (t.closest('[hidden]')) return;
      const d = t.getBoundingClientRect().top - (t.classList.contains('snap-mark') ? line - GAP : line);
      if (Math.abs(d) <= SNAP_PX && Math.abs(d) > 2 && (!best || Math.abs(d) < Math.abs(best))) best = d;
    });
    if (best !== null) { snapping = true; window.scrollBy({ top: best, behavior: 'smooth' }); }
  };
  if ('onscrollend' in window) window.addEventListener('scrollend', settle);
  else window.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(settle, 160); }, { passive: true });
})();

/* =========================================================
   Terminal clock (IST)
   ========================================================= */
(() => {
  const el = document.getElementById('term-clock');
  if (!el) return;
  const tick = () => {
    try {
      el.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    } catch (e) { el.textContent = ''; }
  };
  tick();
  setInterval(tick, 1000);
})();

/* =========================================================
   VBHV: journey as a price chart with event markers
   ========================================================= */
(() => {
  'use strict';
  const host = document.getElementById('q-chart');
  if (!host) return;
  const $ = (id) => document.getElementById(id);

  // t = fractional year; v = illustrative index level at that event
  const EVENTS = [
    { t: 2017.3, v: 100, d: '2017', title: 'KVPY Fellowship',
      body: '1 of 869 recipients in the Class 11 SA stream, awarded by IISc. Attended the Vijyoshi camp at IISER Bhopal. Class X: 10/10.' },
    { t: 2018.4, v: 128, d: '2018', title: 'NDA AIR 10',
      body: 'All India Rank 10 of the 520 recommended, out of 6,931 candidates selected in round 1. It meant I could have joined the Indian Air Force as a pilot.' },
    { t: 2019.5, v: 141, d: '2019', title: 'The first crossroads: engineering',
      body: 'I chose a B.Tech in IT at NSUT over the NDA. Class XII 97%, JEE Mains top 0.834%ile of 11L+, JEE Advanced top 3.2%ile.' },
    { t: 2021.05, v: 166, d: 'Jan 2021', title: '5G Hackathon, ₹1 Lakh',
      body: 'Project SATARK picked among the Top 100 use cases, from 1,000+ entries, in the Department of Telecommunications\' 5G Hackathon.' },
    { t: 2021.2, v: 172, d: 'Mar 2021', title: 'Reply Code Challenge',
      body: 'India Rank 10 and World Rank 106 among 2,000+ teams.' },
    { t: 2021.6, v: 205, d: 'Aug 2021', title: 'CanSat: International Rank 2',
      body: 'Led a 10-member team to a final score of 99.17% and International Rank 2 of 200+ teams at the NASA, Lockheed Martin and US NRL sponsored competition, as a sophomore.' },
    { t: 2021.85, v: 212, d: 'Nov 2021', title: 'Chandigarh Police Hackathon',
      body: '2nd overall and ₹50,000 at the hackathon run by Chandigarh Police and Infosys.' },
    { t: 2022.4, v: 226, d: 'May 2022', title: 'LinkedIn SRE intern → PPO',
      body: 'Cut API operational costs on the Groups platform by 75%; converted to a pre-placement offer.' },
    { t: 2022.95, v: 248, d: 'Dec 2022', title: 'CAT 99.89 percentile',
      body: 'VARC 99.97 percentile out of 2.8L+ candidates. Admits from IIM A, C, K and I, and a decision to defer IIM A for two years.' },
    { t: 2023.5, v: 262, d: 'Jul 2023', title: 'LinkedIn Software Engineer',
      body: 'Joined Observability Engineering (Logs & Events). Graduated NSUT with 8.95/10 and Department Rank 3/147.' },
    { t: 2024.5, v: 318, d: '2023–25', title: '$1M+ saved · 0 → 300K events/day',
      body: 'Migrated 3PB+ of daily log ingestion across Azure regions, ran a 9PB+/day logs platform, helped build the events platform from scratch, made traffic shifts 83% faster. Bravo award twice.' },
    { t: 2025.45, v: 334, d: 'Jun 2025', title: 'IIM Ahmedabad, PGP 2025–27',
      body: 'I finally took up the admit I had deferred. First year was mostly deadlines and back-to-back submissions, with basketball in between.' },
    { t: 2026.25, v: 361, d: 'Apr 2026', title: 'Deutsche Bank: Investment Banking',
      body: 'A summer internship in investment banking, where I learned a lot about valuation, diligence and how to underwrite a business.' },
    { t: 2026.5, v: 378, d: 'Jul 2026', title: 'Xceedance Scholarship',
      body: 'Merit scholarship for first-year academic performance, covering the entire second-year fee (~₹14 lakh).' },
    { t: 2026.58, v: 392, d: '2026', title: 'Campus Fund: Investment Partner',
      body: 'I back student founders from their earliest days, this time from the other side of the table.' },
  ];
  const NOW = 2026.82;
  if (window.__variant && window.__variant.honors === 'chart') {
    [
      { t: 2020.05, d: 'Jan 2020', title: "Best Delegate, AMIMUN'20",
        body: "Best Delegate out of 100+ at AMIMUN'20, after a Special Mention at SYMUNC'19." },
      { t: 2022.6, d: '2022', title: 'CVSPK Scholarship',
        body: 'Top 5% of a batch of 1,280+ at NSUT, with a full tuition waiver in two of four years.' },
      { t: 2025.85, d: '2025', title: 'PM Dissect semi-finalist',
        body: 'Top 25 of 99 teams (219 participants) in the ProdMan Club case competition at IIM A.' },
      { t: 2026.1, d: '2026', title: "Silver at Sangharsh'26",
        body: 'Basketball silver at the inter-IIM sports tournament.' },
    ].forEach((e) => EVENTS.push(e));
    EVENTS.sort((a, b) => a.t - b.t);
    EVENTS.forEach((e, i) => {
      if (e.v !== undefined) return;
      const prev = EVENTS[i - 1], next = EVENTS.slice(i + 1).find((x) => x.v !== undefined);
      e.v = prev.v + (next.v - prev.v) * ((e.t - prev.t) / (next.t - prev.t));
    });
  }

  // monthly series through the events with small seeded wiggles
  let seed = 42;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const knots = [{ t: 2017.0, v: 92 }, ...EVENTS.map((e) => ({ t: e.t, v: e.v })), { t: NOW, v: 401 }];
  const series = [];
  for (let k = 0; k < knots.length - 1; k++) {
    const a = knots[k], b = knots[k + 1];
    const steps = Math.max(1, Math.round((b.t - a.t) * 12));
    for (let s = 0; s < steps; s++) {
      const f = s / steps;
      const noise = s === 0 ? 0 : (rand() - 0.5) * 0.06 * a.v * Math.sin(Math.PI * f);
      series.push({ t: a.t + (b.t - a.t) * f, v: a.v + (b.v - a.v) * f + noise });
    }
  }
  series.push(knots[knots.length - 1]);

  let range = 0; // 0 = MAX
  let sel = EVENTS.length - 1;

  const render = () => {
    const W = Math.max(280, host.clientWidth - 16);
    const H = host.querySelector('svg') ? host.querySelector('svg').clientHeight || 340 : (window.innerWidth < 620 ? 260 : 340);
    const t0 = range ? NOW - range : 2017.0;
    const pts = series.filter((p) => p.t >= t0);
    const evs = EVENTS.map((e, i) => ({ ...e, i })).filter((e) => e.t >= t0);
    const vMin = Math.min(...pts.map((p) => p.v)) * 0.95, vMax = Math.max(...pts.map((p) => p.v)) * 1.03;
    const padL = 6, padR = 44, padT = 14, padB = 22;
    const x = (t) => padL + ((t - t0) / (NOW - t0)) * (W - padL - padR);
    const y = (v) => padT + (1 - (v - vMin) / (vMax - vMin)) * (H - padT - padB);

    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
    const area = `${line}L${x(pts[pts.length - 1].t).toFixed(1)},${H - padB}L${x(pts[0].t).toFixed(1)},${H - padB}Z`;

    const grid = [0, 1, 2, 3, 4].map((g) => {
      const yy = padT + (g / 4) * (H - padT - padB);
      const v = vMax - (g / 4) * (vMax - vMin);
      return `<line x1="${padL}" x2="${W - padR}" y1="${yy}" y2="${yy}"/><text x="${W - padR + 6}" y="${yy + 3}">${v.toFixed(0)}</text>`;
    }).join('');
    const years = [];
    for (let yr = Math.ceil(t0); yr <= Math.floor(NOW); yr++) years.push(yr);
    const step = years.length > 6 && W < 520 ? 2 : 1;
    const xAxis = years.filter((_, i) => i % step === 0)
      .map((yr) => `<text x="${x(yr)}" y="${H - 6}" text-anchor="middle">${yr}</text>`).join('');

    const marks = evs.map((e) => {
      const yy = y(series.reduce((best, p) => Math.abs(p.t - e.t) < Math.abs(best.t - e.t) ? p : best).v);
      return `<g class="q-mark${e.i === sel ? ' sel' : ''}" data-i="${e.i}" tabindex="0" role="button" aria-label="${e.d}: ${e.title}">
        <line x1="${x(e.t)}" x2="${x(e.t)}" y1="${yy + 6}" y2="${H - padB}" stroke="var(--border)" stroke-dasharray="2 3"/>
        <circle cx="${x(e.t)}" cy="${yy}" r="5"/></g>`;
    }).join('');

    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Illustrative price chart of Vaibhav's journey with event markers">
      <defs><linearGradient id="q-grad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity="0.28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient></defs>
      <g class="grid axis">${grid}</g><g class="axis">${xAxis}</g>
      <path class="q-area" d="${area}"/><path class="q-line" d="${line}"/>
      ${marks}</svg>`;

    const last = pts[pts.length - 1].v, first = pts[0].v;
    $('q-px').textContent = last.toFixed(2);
    const chg = ((last - first) / first) * 100;
    $('q-chg').textContent = `▲ +${(last - first).toFixed(2)} (+${chg.toFixed(1)}%) ${range ? range + 'Y' : 'since 2017'}`;

    host.querySelectorAll('.q-mark').forEach((m) => {
      const pick = () => { select(+m.dataset.i); };
      m.addEventListener('click', pick);
      m.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
    });
  };

  const show = () => {
    const e = EVENTS[sel];
    $('q-date').textContent = e.d;
    $('q-title').textContent = e.title;
    $('q-body').textContent = e.body;
  };
  const select = (i) => {
    sel = (i + EVENTS.length) % EVENTS.length;
    const t0 = range ? NOW - range : 2017.0;
    if (EVENTS[sel].t < t0) { range = 0; syncRanges(); }
    show();
    render();
  };
  const syncRanges = () => document.querySelectorAll('.q-range').forEach((b) => b.classList.toggle('active', +b.dataset.r === range));
  document.querySelectorAll('.q-range').forEach((b) => b.addEventListener('click', () => {
    range = +b.dataset.r; syncRanges();
    const t0 = range ? NOW - range : 2017.0;
    if (EVENTS[sel].t < t0) sel = EVENTS.length - 1;
    show(); render();
  }));
  $('q-prev').addEventListener('click', () => select(sel - 1));
  $('q-next').addEventListener('click', () => select(sel + 1));

  show();
  render();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 120); });
})();

/* =========================================================
   Honors tables: one per act (split) or all in the epilogue
   ========================================================= */
(() => {
  const H = [
    // act, code, honor, detail, result, field, year
    ['campus', 'NDA', 'NDA-2 Exam 2018', '520 recommended of 6,931 R1-selected', 'AIR 10', 'Defence', '2018'],
    ['campus', 'KVPY', 'KVPY Fellowship', 'IISc · Class 11 SA stream', '1 / 869', 'Science', '2017'],
    ['campus', 'JEE', 'JEE Mains / Advanced', '11L+ / 1.7L+ candidates', 'Top 0.834% / 3.2%', 'Engineering', '2019'],
    ['campus', 'CVSPK', 'CVSPK Scholarship', 'NSUT · top 5% of 1,280+', '100% tuition waiver', 'Merit', '2022'],
    ['campus', 'RPLY', 'Reply Code Challenge', '2,000+ teams', 'India #10 · World #106', 'Coding', '2021'],
    ['campus', 'MUN', "AMIMUN'20 · SYMUNC'19", 'Model United Nations', 'Best Delegate · Special Mention', 'Debate', '2019–20'],
    ['other', 'CNST', 'CanSat 2021', 'NASA · Lockheed Martin · US NRL', 'Intl Rank 2 / 200+', 'Aerospace', '2021'],
    ['other', 'NSUT', 'B.Tech, Information Technology', 'NSUT Delhi', '8.95/10 · Rank 3/147', 'Academics', '2023'],
    ['other', 'BRVO', 'Bravo Award ×2', 'LinkedIn · incident response capabilities', 'Sole recipient among 4', 'Engineering', '2023–25'],
    ['fin', 'CAT', 'CAT 2022', 'VARC 99.97 %ile · 2.8L+ candidates', '99.89 %ile', 'Management', '2022'],
    ['fin', 'XCDN', 'Xceedance Scholarship', 'IIMA Endowment Fund · full 2nd-year fee', '~₹14 L', 'Merit', '2026'],
    ['fin', 'PMD', 'PM Dissect', 'ProdMan Club, IIM A · 99 teams, 219 participants', 'Top 25 · semi-finalist', 'Product', '2025'],
  ];
  document.querySelectorAll('table.holdings[data-act]').forEach((table) => {
    const act = table.dataset.act;
    const rows = act === 'all' ? H : H.filter((r) => r[0] === act);
    table.querySelector('thead').innerHTML = `<tr>${table.dataset.cols.split(',').map((c) => `<th>${c}</th>`).join('')}</tr>`;
    table.querySelector('tbody').innerHTML = rows.map(([, t, n, sub, pos, f, y]) => `
      <tr><td class="h-tkr">${t}</td><td class="h-name">${n}<small>${sub}</small></td>
      <td class="h-up">▲ ${pos}</td><td>${f}</td><td class="h-yr">${y}</td></tr>`).join('');
  });
})();

/* =========================================================
   Theme toggle (light / dark) with persistence
   ========================================================= */
(() => {
  'use strict';
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const icon = btn.querySelector('.theme-icon');
  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (icon) icon.textContent = theme === 'dark' ? '☾' : '☀';
  };
  apply(root.getAttribute('data-theme') || 'dark');
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    window.dispatchEvent(new Event('themechange'));
  });
})();
