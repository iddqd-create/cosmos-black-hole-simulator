/**
 * CosmosBlackHole - Universe Passport & Scientific Exporter
 * Generates academic reports in Markdown, JSON, and printable formats.
 */

import { REFERENCE_CONSTANTS, ASTRONOMICAL } from '../physics/constants.js';

export class UniverseExporter {
  static generateMarkdownReport(universeData) {
    const { constants, scalings, dimensionless, stellar, pbh, anthropic, smolin, blackHoleFunctions } = universeData;
    const testMass = 10 * ASTRONOMICAL.M_sun;
    const rs = (blackHoleFunctions.calcRs(testMass) / 1000).toFixed(2);
    const rph = (blackHoleFunctions.calcRph(testMass) / 1000).toFixed(2);
    const th = blackHoleFunctions.calcHawkingTemp(testMass).toExponential(2);
    const tau = blackHoleFunctions.calcHawkingLifetime(testMass).toExponential(2);

    return `# Научный паспорт Вселенной: CosmosBlackHole
**Дата генерации:** ${new Date().toISOString().slice(0, 10)}
**Классификация режима:** ${anthropic.regime}
**Антропный индекс пригодности для жизни:** ${anthropic.fitness.toFixed(2)}%
**Фитнес Смолина (Рождение ЧД):** ${smolin.fitness.toFixed(2)} / 100

---

## 1. Фундаментальные физические константы

| Константа | Обозначение | Значение | Отношение к Нашей Вселенной |
|---|---|---|---|
| Гравитационная постоянная | $G$ | ${constants.G.toExponential(4)} м³/(кг·с²) | ${scalings.rG.toFixed(3)}× |
| Скорость света | $c$ | ${constants.c.toExponential(4)} м/с | ${scalings.rc.toFixed(3)}× |
| Постоянная Планка | $\\hbar$ | ${constants.hbar.toExponential(4)} Дж·с | ${scalings.rhbar.toFixed(3)}× |
| Тонкая структура | $\\alpha$ | ${constants.alpha.toFixed(6)} | ${scalings.ralpha.toFixed(3)}× |
| Масса протона | $m_p$ | ${constants.mp.toExponential(4)} кг | ${scalings.rmp.toFixed(3)}× |
| Масса электрона | $m_e$ | ${constants.me.toExponential(4)} кг | ${scalings.rme.toFixed(3)}× |
| Космологическая постоянная | $\\Lambda$ | ${constants.Lambda.toExponential(4)} м⁻² | ${scalings.rLambda.toFixed(3)}× |
| Амплитуда возмущений | $Q$ | ${constants.Q.toExponential(4)} | ${scalings.rQ.toFixed(3)}× |

---

## 2. Астрофизические пороги и свойства чёрных дыр

- **Предел Чандрасекара ($M_{\\text{Ch}}$):** ${stellar.M_Ch_solar.toFixed(3)} $M_\\odot$ (${stellar.M_Ch_kg.toExponential(3)} кг)
- **Предел Оппенгеймера-Волкова ($M_{\\text{TOV}}$):** ${stellar.M_TOV_solar.toFixed(3)} $M_\\odot$
- **Радиус Шварцшильда для 10 $M_\\odot$ ($r_s$):** ${rs} км
- **Фотонная сфера ($r_{\\text{ph}}$):** ${rph} км
- **Температура излучения Хокинга ($T_H$ для 10 $M_\\odot$):** ${th} К
- **Время испарения Хокинга ($\\tau_{\\text{evap}}$):** ${tau} лет
- **Доля первичных ЧД (формализм Пресса-Шехтера $\\beta$):** ${pbh.beta_PBH.toExponential(3)}
- **Порог испарившихся к сегодня PBH ($M_{\\text{evap}}$):** ${pbh.M_pbh_evap_today_kg.toExponential(3)} кг

---

## 3. Звёздная эволюция и антропные критерии

- **Стабильность термоядерных звёзд:** ${stellar.starsCanForm ? "Да" : "Нет"}
- **Диапазон масс звёзд:** ${stellar.starsCanForm ? `${stellar.M_min_star_solar.toFixed(2)} — ${stellar.M_max_star_solar.toFixed(1)} M_☉` : "Невозможны"}
- **Время жизни солнцеподобной звезды:** ${(stellar.tau_star_years / 1e9).toFixed(2)} млрд лет
- **Резонанс Хойла ($3\\alpha \\to {}^{12}\\text{C}$):** ${(anthropic.score_hoyle * 100).toFixed(0)}% совпадения
- **Стабильность атомной химии:** ${(anthropic.score_atoms * 100).toFixed(0)}%
- **Безразмерная гравитационная связь ($\\alpha_G$):** ${dimensionless.alpha_G.toExponential(3)}
- **Число Риса ($N = \\alpha / \\alpha_G$):** ${dimensionless.N_Rees.toExponential(3)}

---
*Сгенерировано в исследовательской утилите CosmosBlackHole.*
`;
  }

  static generateJSONReport(universeData) {
    const { constants, scalings, dimensionless, stellar, pbh, anthropic, smolin } = universeData;
    return JSON.stringify({
      title: "CosmosBlackHole Universe Report",
      timestamp: new Date().toISOString(),
      regime: anthropic.regime,
      fitnessScores: {
        anthropicHabitability: anthropic.fitness,
        smolinCNS: smolin.fitness
      },
      constants,
      scalings,
      dimensionless,
      stellar: {
        M_Ch_solar: stellar.M_Ch_solar,
        M_TOV_solar: stellar.M_TOV_solar,
        M_min_solar: stellar.M_min_star_solar,
        M_max_solar: stellar.M_max_star_solar,
        tau_star_years: stellar.tau_star_years,
        starsCanForm: stellar.starsCanForm
      },
      pbh: {
        beta: pbh.beta_PBH,
        delta_c: pbh.delta_c,
        M_evap_today_kg: pbh.M_pbh_evap_today_kg
      }
    }, null, 2);
  }

  static copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
  }

  static downloadFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
