// Background "word field": faint words in a grid; a few at a time glow and fade.
// Canvas 2D, no dependencies. Static frame under prefers-reduced-motion.
(function () {
  const canvas = document.getElementById("word-field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const WORDS = [
    "private", "local", "offline", "tokens", "llama", "qwen", "mistral", "gemma",
    "whisper", "embed", "RAG", "docker", "ollama", "linux", "inference", "context",
    "prompt", "agent", "vector", "quantize", "GGUF", "self-host", "no cloud", "your data",
    "私隱", "本地", "離線", "模型", "推理", "向量", "語音", "私有",
    "ssh", "api", "lan", "summarize", "translate", "transcribe", "notes", "code",
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const styles = getComputedStyle(document.documentElement);
  const ink = styles.getPropertyValue("--field-ink").trim() || "40, 36, 30";
  const glow = styles.getPropertyValue("--field-glow").trim() || "201, 100, 66";

  let cells = [];
  let width = 0, height = 0, dpr = 1;
  let mouse = { x: -9999, y: -9999 };
  let running = false, last = 0, spawnTimer = 0;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const fontSize = width < 640 ? 12 : 14;
    ctx.font = `${fontSize}px "Geist Mono", ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";

    const rowH = fontSize * 3.2;
    const colW = width < 640 ? 110 : 150;
    cells = [];
    let i = 0;
    for (let row = 0, y = rowH / 2; y < height + rowH; row++, y += rowH) {
      const offset = (row % 2) * (colW / 2);
      for (let x = -colW / 2 + offset; x < width + colW; x += colW) {
        const word = WORDS[Math.floor(pseudo(i * 3.7 + row * 1.3) * WORDS.length)];
        cells.push({
          word,
          x: x + (pseudo(i) - 0.5) * 24,
          y: y + (pseudo(i + 99) - 0.5) * 8,
          w: ctx.measureText(word).width,
          glow: 0,      // 0..1 current
          phase: 0,     // 0 idle, 1 rising, 2 holding, 3 falling
          hold: 0,
          speed: 0,
        });
        i++;
      }
    }
  }

  function pseudo(n) {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }

  function ignite(count) {
    for (let k = 0; k < count; k++) {
      const c = cells[(Math.random() * cells.length) | 0];
      if (c && c.phase === 0) {
        c.phase = 1;
        c.speed = 0.6 + Math.random() * 0.8;
        c.hold = 600 + Math.random() * 1400;
      }
    }
  }

  function draw(dt) {
    ctx.clearRect(0, 0, width, height);
    for (const c of cells) {
      if (c.phase === 1) {
        c.glow += (dt / 900) * c.speed;
        if (c.glow >= 1) { c.glow = 1; c.phase = 2; }
      } else if (c.phase === 2) {
        c.hold -= dt;
        if (c.hold <= 0) c.phase = 3;
      } else if (c.phase === 3) {
        c.glow -= (dt / 1600) * c.speed;
        if (c.glow <= 0) { c.glow = 0; c.phase = 0; }
      }

      const dx = c.x + c.w / 2 - mouse.x;
      const dy = c.y - mouse.y;
      const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 180) * 0.5;
      const g = Math.max(c.glow, near);

      if (g > 0.01) {
        const eased = g * g * (3 - 2 * g);
        ctx.shadowColor = `rgba(${glow}, ${0.45 * eased})`;
        ctx.shadowBlur = 18 * eased;
        ctx.fillStyle = `rgba(${glow}, ${0.1 + 0.5 * eased})`;
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(${ink}, 0.07)`;
      }
      ctx.fillText(c.word, c.x, c.y);
    }
    ctx.shadowBlur = 0;
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min(64, t - (last || t));
    last = t;
    spawnTimer += dt;
    if (spawnTimer > 140) {
      spawnTimer = 0;
      ignite(Math.random() < 0.5 ? 1 : 2);
    }
    draw(dt);
    requestAnimationFrame(frame);
  }

  function start() {
    if (reduceMotion.matches) {
      running = false;
      // Static: a handful of words lit, no motion.
      cells.forEach((c, i) => { c.glow = pseudo(i + 7) > 0.96 ? 0.7 : 0; });
      draw(0);
      return;
    }
    if (running) return;
    running = true;
    last = 0;
    requestAnimationFrame(frame);
  }

  function stop() { running = false; }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layout(); if (!running) start(); }, 150);
  });
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") { mouse.x = e.clientX; mouse.y = e.clientY; }
  }, { passive: true });
  document.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduceMotion.addEventListener?.("change", () => { stop(); start(); });

  layout();
  start();
  // Re-measure once the web font is in, so word widths match what is drawn.
  document.fonts?.ready.then(() => { layout(); if (!running) start(); });
})();
