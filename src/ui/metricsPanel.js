/**
 * CosmosBlackHole - Scientific Metrics Panel & Delta-diff Engine
 * Real-time display of physical limits with percentage deviations compared to Our Universe.
 */

import { ASTRONOMICAL } from '../physics/constants.js';

export class MetricsPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.refMetrics = null;
  }

  setReferenceUniverse(refUniverseData) {
    this.refMetrics = refUniverseData;
  }

  formatDelta(currentVal, refVal, unit = '%') {
    if (!refVal || refVal === 0 || !isFinite(currentVal)) return '';
    const ratio = currentVal / refVal;
    if (Math.abs(ratio - 1.0) < 0.001) {
      return `<span class="delta delta-neutral">0% (Наша Вселенная)</span>`;
    }
    const percentDiff = (ratio - 1.0) * 100.0;
    if (Math.abs(percentDiff) < 1000) {
      const sign = percentDiff > 0 ? '+' : '';
      const cls = percentDiff > 0 ? 'delta-pos' : 'delta-neg';
      return `<span class="delta ${cls}">${sign}${percentDiff.toFixed(1)}%</span>`;
    } else {
      const expRatio = ratio.toExponential(1);
      const sign = ratio > 1 ? '+' : '';
      return `<span class="delta delta-extreme">${sign}${expRatio}×</span>`;
    }
  }

  update(universeData) {
    const { stellar, pbh, anthropic, smolin, dimensionless, blackHoleFunctions } = universeData;
    const ref = this.refMetrics;

    // Calculations for standard test 10 M_sun black hole
    const testMassKg = 10 * ASTRONOMICAL.M_sun;
    const rs_km = (blackHoleFunctions.calcRs(testMassKg) / 1000).toFixed(2);
    const rph_km = (blackHoleFunctions.calcRph(testMassKg) / 1000).toFixed(2);
    const Th_kelvin = blackHoleFunctions.calcHawkingTemp(testMassKg);
    const tau_evap_yr = blackHoleFunctions.calcHawkingLifetime(testMassKg);

    const refRs_km = ref ? ref.blackHoleFunctions.calcRs(testMassKg) / 1000 : 29.53;
    const refM_Ch = ref ? ref.stellar.M_Ch_solar : 1.44;
    const refM_TOV = ref ? ref.stellar.M_TOV_solar : 2.16;
    const refTauStar = ref ? ref.stellar.tau_star_years : 1e10;

    // Regimes & Anthropic Fitness status
    const fitnessColor = anthropic.fitness > 70 ? '#00e676' : anthropic.fitness > 25 ? '#ffb300' : '#ff3d00';
    const smolinColor = smolin.fitness > 60 ? '#00e5ff' : '#ba68c8';

    let html = `
      <!-- TOP STATUS BANNER -->
      <div class="status-banner" style="border-left: 4px solid ${anthropic.regimeColor};">
        <div class="status-main">
          <div class="status-regime-title" style="color: ${anthropic.regimeColor};">
            ${anthropic.regime}
          </div>
          <div class="status-regime-desc">${anthropic.regimeDetails}</div>
        </div>
        <div class="status-scores">
          <div class="score-card" title="Антропный индекс пригодности для жизни и сознания (0-100%)">
            <span class="score-label">Антропный индекс (Жизнь)</span>
            <span class="score-val" style="color: ${fitnessColor};">${anthropic.fitness.toFixed(1)}%</span>
          </div>
          <div class="score-card" title="Индекс Смолина: эффективность порождения дочерних Вселенных через ЧД">
            <span class="score-label">Фитнес Смолина (ЧД)</span>
            <span class="score-val" style="color: ${smolinColor};">${smolin.fitness.toFixed(1)} / 100</span>
          </div>
        </div>
      </div>

      <!-- METRICS GRID -->
      <div class="metrics-grid">
        <!-- Card 1: Chandrasekhar Limit -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Предел Чандрасекара (M_Ch)</span>
            ${this.formatDelta(stellar.M_Ch_solar, refM_Ch)}
          </div>
          <div class="metric-value-primary">
            ${stellar.M_Ch_solar < 1e4 && stellar.M_Ch_solar > 0.01 ? stellar.M_Ch_solar.toFixed(3) : stellar.M_Ch_solar.toExponential(2)} <span class="metric-unit">M☉</span>
          </div>
          <div class="metric-value-sub">
            ${(stellar.M_Ch_kg).toExponential(3)} кг (порог белых карликов)
          </div>
        </div>

        <!-- Card 2: TOV Limit -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Предел Оппенгеймера-Волкова (M_TOV)</span>
            ${this.formatDelta(stellar.M_TOV_solar, refM_TOV)}
          </div>
          <div class="metric-value-primary">
            ${stellar.M_TOV_solar < 1e4 && stellar.M_TOV_solar > 0.01 ? stellar.M_TOV_solar.toFixed(3) : stellar.M_TOV_solar.toExponential(2)} <span class="metric-unit">M☉</span>
          </div>
          <div class="metric-value-sub">
            Порог гравитационного схлопа в ЧД
          </div>
        </div>

        <!-- Card 3: Schwarzschild Radius -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Радиус Шварцшильда (r_s для 10 M☉)</span>
            ${this.formatDelta(parseFloat(rs_km), refRs_km)}
          </div>
          <div class="metric-value-primary">
            ${rs_km} <span class="metric-unit">км</span>
          </div>
          <div class="metric-value-sub">
            Фотонная сфера r_ph = ${rph_km} км
          </div>
        </div>

        <!-- Card 4: Stellar Lifetime -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Время жизни 1 M☉ звезды (τ*)</span>
            ${this.formatDelta(stellar.tau_star_years, refTauStar)}
          </div>
          <div class="metric-value-primary">
            ${(stellar.tau_star_years / 1e9).toExponential(2)} <span class="metric-unit">млрд лет</span>
          </div>
          <div class="metric-value-sub">
            ${stellar.tau_star_years >= 1e9 ? "✓ Достаточно для эволюции разума" : "✗ Слишком мало для биосферы"}
          </div>
        </div>

        <!-- Card 5: Star Mass Window -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Диапазон масс звёзд (M_min – M_max)</span>
            <span class="status-indicator ${stellar.starsCanForm ? 'status-ok' : 'status-err'}">
              ${stellar.starsCanForm ? 'Стабильны' : 'Невозможны'}
            </span>
          </div>
          <div class="metric-value-primary">
            ${stellar.starsCanForm ? `${stellar.M_min_star_solar.toFixed(2)} – ${stellar.M_max_star_solar.toFixed(0)} M☉` : '—'}
          </div>
          <div class="metric-value-sub">
            Горение H₁ против радиационного давления
          </div>
        </div>

        <!-- Card 6: Primordial Black Holes -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Доля первичных ЧД (β_PBH)</span>
            <span class="metric-badge">${pbh.beta_PBH > 1e-4 ? 'Доминируют' : 'Редкие'}</span>
          </div>
          <div class="metric-value-primary">
            ${pbh.beta_PBH === 0 ? '≈ 0' : pbh.beta_PBH.toExponential(2)}
          </div>
          <div class="metric-value-sub">
            Порог Пресса-Шехтера δ_c = ${pbh.delta_c}
          </div>
        </div>

        <!-- Card 7: Hawking Temperature & Lifetime -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Испарение ЧД (10 M☉)</span>
            <span class="metric-badge">T_H</span>
          </div>
          <div class="metric-value-primary">
            ${Th_kelvin.toExponential(2)} <span class="metric-unit">К</span>
          </div>
          <div class="metric-value-sub">
            Время жизни: ${(tau_evap_yr).toExponential(2)} лет
          </div>
        </div>

        <!-- Card 8: Dimensionless Rees Ratio N -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-name">Число Риса N = α / α_G</span>
            <span class="metric-badge">ЭМ / Гравитация</span>
          </div>
          <div class="metric-value-primary">
            ${(dimensionless.N_Rees).toExponential(2)}
          </div>
          <div class="metric-value-sub">
            α_G = ${(dimensionless.alpha_G).toExponential(3)}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}
