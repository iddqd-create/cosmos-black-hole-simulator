/**
 * CosmosBlackHole - 2D Interactive Anthropic Phase Diagram
 * Visualizes the parameter space of fundamental constants, highlighting the
 * fine-tuned Anthropic Zone, Black Hole Dominated collapse regimes, and starless cold realms.
 */

export class PhaseDiagram {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.mode = 'couplings'; // 'couplings' (alpha vs alpha_G) or 'cosmo' (G vs Lambda)

    this.setupResolution();
    this.setupHover();
  }

  setupResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 450;
    this.height = rect.height || 320;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupHover() {
    this.mouse = { x: -1, y: -1, hovering: false };

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.hovering = true;
      this.render();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.hovering = false;
      this.render();
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  update(universeData) {
    this.universeData = universeData;
    this.render();
  }

  render() {
    if (!this.universeData) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Dark sleek background
    ctx.fillStyle = '#080b14';
    ctx.fillRect(0, 0, w, h);

    const padding = { left: 55, right: 25, top: 25, bottom: 45 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    if (this.mode === 'couplings') {
      this.renderCouplingsPlot(ctx, padding, plotW, plotH);
    } else {
      this.renderCosmoPlot(ctx, padding, plotW, plotH);
    }
  }

  renderCouplingsPlot(ctx, pad, pw, ph) {
    // X-axis: log10(alpha) from -3.5 to -0.5 (alpha ~ 0.0003 to 0.3)
    // Y-axis: log10(alpha_G) from -45 to -32 (alpha_G ~ 1e-45 to 1e-32)
    const xMin = -3.5, xMax = -0.5;
    const yMin = -45, yMax = -32;

    const toScreenX = (val) => pad.left + ((val - xMin) / (xMax - xMin)) * pw;
    const toScreenY = (val) => pad.top + ph - ((val - yMin) / (yMax - yMin)) * ph;

    // Draw Shaded Regimes
    // 1. Black Hole Dominated Zone (Top area: alpha_G too high -> stars immediately collapse into BHs)
    ctx.fillStyle = 'rgba(255, 23, 68, 0.15)';
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin), toScreenY(-35.5));
    ctx.lineTo(toScreenX(xMax), toScreenY(-34.0));
    ctx.lineTo(toScreenX(xMax), toScreenY(yMax));
    ctx.lineTo(toScreenX(xMin), toScreenY(yMax));
    ctx.closePath();
    ctx.fill();

    // 2. Radiation Pressure / Unstable Stars (Right area: alpha too high -> photon pressure tears stars)
    ctx.fillStyle = 'rgba(124, 77, 255, 0.12)';
    ctx.fillRect(toScreenX(-1.2), pad.top, toScreenX(xMax) - toScreenX(-1.2), ph);

    // 3. Cold Gas / No Ignition (Bottom area: alpha_G too weak -> Jeans collapse impossible)
    ctx.fillStyle = 'rgba(33, 150, 243, 0.12)';
    ctx.fillRect(pad.left, toScreenY(-41.5), pw, toScreenY(yMin) - toScreenY(-41.5));

    // 4. Anthropic Goldilocks Window (Our Universe sits inside this green zone)
    ctx.fillStyle = 'rgba(0, 230, 118, 0.25)';
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(toScreenX(-2.14), toScreenY(-38.23), pw * 0.15, ph * 0.16, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -3.0; x <= -1.0; x += 0.5) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, pad.top);
      ctx.lineTo(sx, pad.top + ph);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`10^${x}`, sx - 12, pad.top + ph + 16);
    }
    for (let y = -44; y <= -32; y += 3) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(pad.left, sy);
      ctx.lineTo(pad.left + pw, sy);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`10^${y}`, pad.left - 42, sy + 3);
    }

    // Zone text labels
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#ff5252';
    ctx.fillText('Доминирование ЧД (Быстрый коллапс)', pad.left + 15, pad.top + 20);

    ctx.fillStyle = '#00e676';
    ctx.fillText('Антропная зона (Жизнь и разум)', toScreenX(-2.5), toScreenY(-37.2));

    ctx.fillStyle = '#64b5f6';
    ctx.fillText('Беззвёздный холодный газ', pad.left + 15, pad.top + ph - 12);

    // Reference Point: Our Universe (log10(alpha0) ~ -2.137, log10(alpha_G0) ~ -38.23)
    const ourSx = toScreenX(-2.137);
    const ourSy = toScreenY(-38.23);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ourSx, ourSy, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('★ Наша Вселенная', ourSx + 8, ourSy - 5);

    // Current Universe Point
    const curAlpha = this.universeData.dimensionless.alpha;
    const curAlphaG = this.universeData.dimensionless.alpha_G;
    const curLogAlpha = Math.log10(Math.max(1e-10, curAlpha));
    const curLogAlphaG = Math.log10(Math.max(1e-60, curAlphaG));

    const curSx = Math.max(pad.left, Math.min(pad.left + pw, toScreenX(curLogAlpha)));
    const curSy = Math.max(pad.top, Math.min(pad.top + ph, toScreenY(curLogAlphaG)));

    // Pulsating circle
    const pulse = 6 + Math.sin(performance.now() * 0.005) * 2;
    ctx.fillStyle = this.universeData.anthropic.regimeColor || '#00e5ff';
    ctx.beginPath();
    ctx.arc(curSx, curSy, pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(curSx, curSy, pulse + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('● Текущая Вселенная', curSx + 12, curSy + 4);

    // Axis titles
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Электромагнитная связь log₁₀(α)', pad.left + pw / 2 - 80, pad.top + ph + 34);
    ctx.save();
    ctx.translate(14, pad.top + ph / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Гравитационная связь log₁₀(α_G)', 0, 0);
    ctx.restore();
  }

  renderCosmoPlot(ctx, pad, pw, ph) {
    // X-axis: log10(G / G0) from -2 to 2
    // Y-axis: log10(Lambda / Lambda0) from -2 to 4
    const xMin = -2, xMax = 2;
    const yMin = -2, yMax = 4;

    const toScreenX = (val) => pad.left + ((val - xMin) / (xMax - xMin)) * pw;
    const toScreenY = (val) => pad.top + ph - ((val - yMin) / (yMax - yMin)) * ph;

    // Regimes
    // 1. Runaway de Sitter Expansion (Top area: Lambda dominates before stars form)
    ctx.fillStyle = 'rgba(186, 104, 200, 0.18)';
    ctx.fillRect(pad.left, pad.top, pw, toScreenY(1.8) - pad.top);

    // 2. Early Crunch / Super-G (Right bottom: high G, low Lambda)
    ctx.fillStyle = 'rgba(255, 87, 34, 0.18)';
    ctx.fillRect(toScreenX(0.8), toScreenY(1.8), toScreenX(xMax) - toScreenX(0.8), pad.top + ph - toScreenY(1.8));

    // 3. Stable Structure Formation (Center Goldilocks)
    ctx.fillStyle = 'rgba(0, 230, 118, 0.22)';
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(toScreenX(-0.5), toScreenY(1.0), toScreenX(0.5) - toScreenX(-0.5), toScreenY(-1.0) - toScreenY(1.0));
    ctx.strokeRect(toScreenX(-0.5), toScreenY(1.0), toScreenX(0.5) - toScreenX(-0.5), toScreenY(-1.0) - toScreenY(1.0));

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -2; x <= 2; x += 1) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, pad.top);
      ctx.lineTo(sx, pad.top + ph);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${x > 0 ? '+' : ''}${x}`, sx - 5, pad.top + ph + 16);
    }
    for (let y = -2; y <= 4; y += 1) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(pad.left, sy);
      ctx.lineTo(pad.left + pw, sy);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${y > 0 ? '+' : ''}${y}`, pad.left - 24, sy + 3);
    }

    // Labels
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#ce93d8';
    ctx.fillText('Разрыв расширением (Экспоненциальное Λ)', pad.left + 15, pad.top + 20);

    ctx.fillStyle = '#00e676';
    ctx.fillText('Окно галактик и звёзд', toScreenX(-0.4), toScreenY(0.2));

    ctx.fillStyle = '#ff7043';
    ctx.fillText('Ранний схлоп в ЧД', toScreenX(0.9), toScreenY(-0.5));

    // Our Universe
    const ourSx = toScreenX(0);
    const ourSy = toScreenY(0);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ourSx, ourSy, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('★ Наша (0,0)', ourSx + 8, ourSy - 5);

    // Current Universe
    const logG = Math.log10(Math.max(1e-4, this.universeData.scalings.rG));
    const logLambda = Math.log10(Math.max(1e-4, this.universeData.scalings.rLambda));
    const curSx = Math.max(pad.left, Math.min(pad.left + pw, toScreenX(logG)));
    const curSy = Math.max(pad.top, Math.min(pad.top + ph, toScreenY(logLambda)));

    const pulse = 6 + Math.sin(performance.now() * 0.005) * 2;
    ctx.fillStyle = this.universeData.anthropic.regimeColor || '#00e5ff';
    ctx.beginPath();
    ctx.arc(curSx, curSy, pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(curSx, curSy, pulse + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('● Текущая Вселенная', curSx + 12, curSy + 4);

    // Axis titles
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('log₁₀(G / G₀) Гравитация', pad.left + pw / 2 - 60, pad.top + ph + 34);
    ctx.save();
    ctx.translate(16, pad.top + ph / 2 + 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('log₁₀(Λ / Λ₀) Тёмная энергия', 0, 0);
    ctx.restore();
  }
}
