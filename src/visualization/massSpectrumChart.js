/**
 * CosmosBlackHole - Black Hole Mass Spectrum Chart (dN / d log M)
 * Displays the distribution of black hole populations: Primordial Black Holes (PBH),
 * Hawking Evaporation Boundary, and Stellar-mass Collapsars.
 */

import { ASTRONOMICAL } from '../physics/constants.js';

export class MassSpectrumChart {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.setupResolution();
    this.setupHover();
  }

  setupResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 450;
    this.height = rect.height || 260;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupHover() {
    this.mouse = { x: -1, y: -1, active: false };
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
      this.render();
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      this.render();
    });
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

    const pad = { left: 55, right: 25, top: 25, bottom: 40 };
    const pw = w - pad.left - pad.right;
    const ph = h - pad.top - pad.bottom;

    // Log10(Mass in kg) from 0 to 42 (1 kg to 10^42 kg = 10^12 M_sun)
    const logM_min = 0;
    const logM_max = 42;

    const toScreenX = (logM) => pad.left + ((logM - logM_min) / (logM_max - logM_min)) * pw;
    const toScreenY = (normVal) => pad.top + ph - normVal * ph;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let logM = 0; logM <= 40; logM += 10) {
      const sx = toScreenX(logM);
      ctx.beginPath();
      ctx.moveTo(sx, pad.top);
      ctx.lineTo(sx, pad.top + ph);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`10^${logM} кг`, sx - 15, pad.top + ph + 16);
    }

    const { pbh, stellar, blackHoleFunctions, constants } = this.universeData;

    // 1. Hawking Evaporation Cutoff (M_evap_today)
    const logM_evap = Math.log10(Math.max(1, pbh.M_pbh_evap_today_kg));
    const sxEvap = toScreenX(logM_evap);

    // Evaporated Zone shading (left of M_evap)
    ctx.fillStyle = 'rgba(255, 68, 68, 0.12)';
    ctx.fillRect(pad.left, pad.top, Math.max(0, sxEvap - pad.left), ph);

    ctx.strokeStyle = '#ff4444';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sxEvap, pad.top);
    ctx.lineTo(sxEvap, pad.top + ph);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ff6b6b';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Испарились к сегодня', Math.max(pad.left + 5, sxEvap - 110), pad.top + 14);

    // 2. Primordial Black Hole Distribution Curve (PBH)
    // Centered around inflation horizon scales ~ 10^12 - 10^20 kg
    const pbhAmplitude = Math.min(1.0, Math.max(0.05, pbh.beta_PBH * 1e12 + 0.1));
    ctx.beginPath();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;

    let started = false;
    for (let logM = 5; logM <= 32; logM += 0.5) {
      const center = 16.0;
      const width = 6.0;
      const bell = Math.exp(-Math.pow((logM - center) / width, 2));
      const val = bell * 0.75 * pbhAmplitude;
      const sx = toScreenX(logM);
      const sy = toScreenY(val);

      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // Fill under PBH curve
    ctx.lineTo(toScreenX(32), toScreenY(0));
    ctx.lineTo(toScreenX(5), toScreenY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    ctx.fill();

    // 3. Stellar-mass Black Hole Distribution Curve
    // Range: from M_prog_BH (~ 3 - 100 M_sun = ~ 6e30 - 2e32 kg, logM ~ 30.8 - 32.5)
    if (stellar.starsCanForm) {
      const logM_prog = Math.log10(Math.max(1, stellar.M_TOV_solar * ASTRONOMICAL.M_sun));
      ctx.beginPath();
      ctx.strokeStyle = '#ff9100';
      ctx.lineWidth = 2.5;

      let startedStellar = false;
      for (let logM = logM_prog; logM <= 38; logM += 0.4) {
        // Salpeter-like power law falling towards high mass
        const powerLaw = Math.pow(10, -0.7 * (logM - logM_prog));
        const val = Math.max(0, Math.min(0.9, powerLaw * 0.85 * Math.max(0.2, stellar.stellar_BH_efficiency)));
        const sx = toScreenX(logM);
        const sy = toScreenY(val);

        if (!startedStellar) {
          ctx.moveTo(sx, sy);
          startedStellar = true;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();

      // Fill under stellar curve
      ctx.lineTo(toScreenX(38), toScreenY(0));
      ctx.lineTo(toScreenX(logM_prog), toScreenY(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 145, 0, 0.15)';
      ctx.fill();
    }

    // Legend
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('— Первичные ЧД (PBH)', pad.left + 15, pad.top + ph - 30);
    ctx.fillStyle = '#ff9100';
    ctx.fillText('— Звёздные ЧД (Коллапс)', pad.left + 170, pad.top + ph - 30);

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Масса чёрной дыры log₁₀(M, кг)', pad.left + pw / 2 - 80, pad.top + ph + 34);

    ctx.save();
    ctx.translate(16, pad.top + ph / 2 + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Плотность dN / d log M', 0, 0);
    ctx.restore();
  }
}
