// Adapted from NONG.github.io's flowBackground: the same descending currents,
// with RealNPC's paper and neutral signal colors. No additional animation library.
export function initFlowBackground(canvas: HTMLCanvasElement, coverEnd: HTMLElement | null = null) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const colors = getComputedStyle(document.documentElement);
  const line = colors.getPropertyValue("--muted-text").trim();
  const columns = 64;
  const rows = 48;
  const cells = columns * rows;
  const fieldX = new Float32Array(cells);
  const fieldY = new Float32Array(cells);
  const momentumX = new Float32Array(cells);
  const momentumY = new Float32Array(cells);
  const weights = new Float32Array(cells);
  let particles = new Float32Array(0);
  const trailLength = 96;
  const samplesPerBand = trailLength / 6;
  let trails = new Float32Array(0);
  let trailHead = 0;
  let width = 0;
  let height = 0;
  let frame = 0;
  let coverFrame = 0;
  let previous = 0;
  let tick = 0;
  let seed = 83;
  let disposed = false;
  let paused = false;
  let visible = false;
  let covered = Boolean(coverEnd && coverEnd.getBoundingClientRect().top >= window.innerHeight - 1);
  let needsResize = true;
  let warmup = 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const spawn = (i: number, initial = false) => {
    particles[i] = random() * width;
    particles[i + 1] = random() * height;
    particles[i + 2] = 0;
    particles[i + 3] = 0;
    particles[i + 4] = initial ? random() * 260 : 0;
    particles[i + 5] = 280 + random() * 240;
    const offset = i / 6 * trailLength * 2;
    for (let j = 0; j < trailLength; j++) {
      trails[offset + j * 2] = particles[i];
      trails[offset + j * 2 + 1] = particles[i + 1];
    }
  };

  const step = () => {
    // The driving field changes slowly; particle feedback adds local coherence.
    const phase = tick++ / 1800 * Math.PI * 2;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const k = y * columns + x;
        const u = x / (columns - 1);
        const v = y / (rows - 1);
        const fold = 0.58 * Math.sin(v * 5.8 + u * 4.2 + 0.55 * Math.sin(phase))
          + 0.24 * Math.sin(v * 10.5 - u * 7.5 + 0.35 * Math.cos(phase));
        const angle = Math.PI / 2 + fold;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const weight = weights[k];
        fieldX[k] = dx * 0.82 + (weight ? momentumX[k] / weight : dx) * 0.18;
        fieldY[k] = dy * 0.82 + (weight ? momentumY[k] / weight : dy) * 0.18;
      }
    }
    momentumX.fill(0);
    momentumY.fill(0);
    weights.fill(0);
    for (let i = 0; i < particles.length; i += 6) {
      const x = particles[i];
      const y = particles[i + 1];
      if (++particles[i + 4] > particles[i + 5] || x < 0 || x >= width || y < 0 || y >= height) {
        spawn(i);
        continue;
      }
      const gx = x / width * (columns - 1);
      const gy = y / height * (rows - 1);
      const ix = Math.min(columns - 2, Math.floor(gx));
      const iy = Math.min(rows - 2, Math.floor(gy));
      const fx = gx - ix;
      const fy = gy - iy;
      const k = iy * columns + ix;
      const sample = (field: Float32Array) =>
        (field[k] * (1 - fx) + field[k + 1] * fx) * (1 - fy)
        + (field[k + columns] * (1 - fx) + field[k + columns + 1] * fx) * fy;
      const vx = particles[i + 2] * 0.72 + sample(fieldX) * 0.28;
      const vy = particles[i + 3] * 0.72 + sample(fieldY) * 0.28;
      particles[i + 2] = vx;
      particles[i + 3] = vy;
      const speed = Math.max(0.75, Math.min(width, height) / 670);
      particles[i] += vx * speed;
      particles[i + 1] += vy * speed;
      const offset = i / 6 * trailLength * 2 + trailHead * 2;
      trails[offset] = particles[i];
      trails[offset + 1] = particles[i + 1];
      momentumX[k] += vx;
      momentumY[k] += vy;
      weights[k]++;
    }
    trailHead = (trailHead + 1) % trailLength;
  };

  const paint = () => {
    // Redraw finite trails: alpha accumulation on an 8-bit canvas leaves residue
    // after long sessions and would gradually brighten the reading surface.
    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 0.65;
    for (let band = 0; band < 6; band++) {
      context.beginPath();
      for (let i = 0; i < particles.length; i += 6) {
        const offset = i / 6 * trailLength * 2;
        for (let j = 0; j <= samplesPerBand; j++) {
          const age = Math.min(trailLength - 1, band * samplesPerBand + j);
          const p = offset + (trailHead + age) % trailLength * 2;
          if (!j) context.moveTo(trails[p], trails[p + 1]);
          else context.lineTo(trails[p], trails[p + 1]);
        }
      }
      context.strokeStyle = line;
      context.globalAlpha = (band + 1) * 0.03;
      context.stroke();
    }
    context.globalAlpha = 1;
  };

  const resize = () => {
    needsResize = false;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    if (width === rect.width && height === rect.height && canvas.width === Math.round(rect.width * dpr)) return;
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = new Float32Array((width < 680 ? 650 : 1800) * 6);
    trails = new Float32Array(particles.length / 6 * trailLength * 2);
    trailHead = 0;
    momentumX.fill(0);
    momentumY.fill(0);
    weights.fill(0);
    for (let i = 0; i < particles.length; i += 6) spawn(i, true);
    // Prepare the same still in small batches instead of blocking hydration.
    warmup = 112;
  };

  const render = (now: number) => {
    frame = 0;
    if (disposed || document.hidden || !visible || covered) return;
    if (needsResize) resize();
    if (warmup > 0) {
      const batch = Math.min(warmup, 8);
      for (let i = 0; i < batch; i++) step();
      warmup -= batch;
      if (warmup === 0) paint();
    } else if (!reduced.matches && !paused && now - previous >= 1000 / 30) {
      step();
      paint();
      previous = now - ((now - previous) % (1000 / 30));
    }
    if (warmup > 0 || (!reduced.matches && !paused)) frame = requestAnimationFrame(render);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = performance.now();
    if (!disposed && !document.hidden && visible && !covered &&
        (needsResize || warmup > 0 || (!reduced.matches && !paused))) {
      frame = requestAnimationFrame(render);
    }
  };
  const onResize = () => {
    needsResize = true;
    if (coverEnd) covered = coverEnd.getBoundingClientRect().top >= window.innerHeight - 1;
    sync();
  };
  window.addEventListener("resize", onResize, { passive: true });
  const sizeObserver = new ResizeObserver(onResize);
  sizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > 0;
    sync();
  }, { threshold: [0, 0.001] });
  visibilityObserver.observe(canvas);
  // A scroll jump can cross the entire marker without an intersection event.
  const onScroll = () => {
    if (coverFrame) return;
    coverFrame = requestAnimationFrame(() => {
      coverFrame = 0;
      const nextCovered = Boolean(coverEnd && coverEnd.getBoundingClientRect().top >= window.innerHeight - 1);
      if (covered !== nextCovered) {
        covered = nextCovered;
        sync();
      }
    });
  };
  if (coverEnd) window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  return {
    setPaused(value: boolean) {
      paused = value;
      sync();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(coverFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    },
  };
}
