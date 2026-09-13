/**
 * CosmosBlackHole - Cosmic Evolution Timeline
 * Tracks major cosmic epochs and black hole formation stages from Big Bang
 * to the Black Hole Era and Hawking evaporation.
 */

export class TimelineVisualizer {
  constructor(containerElement) {
    this.container = containerElement;
  }

  update(universeData) {
    const { scalings, stellar, pbh, anthropic } = universeData;

    // Calculate shifted epochs based on constants
    const starLifeGyr = (stellar.tau_star_years / 1e9).toFixed(2);
    const hasStars = stellar.starsCanForm;
    const pbhAbundance = pbh.beta_PBH > 1e-6 ? "Колоссальное (доминируют)" : pbh.beta_PBH > 1e-15 ? "Умеренное" : "Пренебрежимо малое";
    const currentAgeGyr = 13.8;

    const epochs = [
      {
        name: "Инфляция и Первичные ЧД (PBH)",
        time: "10⁻³⁶ – 10⁻¹⁰ с",
        desc: `Флуктуации плотности Q=${(universeData.constants.Q).toExponential(2)}. Рождение PBH: ${pbhAbundance}. Порог коллапса: δc=${pbh.delta_c}.`,
        status: pbh.beta_PBH > 0.01 ? "critical" : "normal",
        icon: "⚫"
      },
      {
        name: "Рекомбинация и Тёмные Века",
        time: "380 000 лет",
        desc: `Формирование первых нейтральных атомов водорода. Электромагнитная связь α=${universeData.constants.alpha.toFixed(5)}.`,
        status: "normal",
        icon: "🌌"
      },
      {
        name: "Первые звёзды (Pop III) и Коллапсары",
        time: "100 – 400 млн лет",
        desc: hasStars 
          ? `Зажигание первых термоядерных звёзд. Минимальная масса: ${stellar.M_min_star_solar.toFixed(2)} M☉. Порог коллапса в ЧД: ${stellar.M_prog_BH_solar.toFixed(1)} M☉.`
          : "Звёзды не способны зажечься (условия термоядерного горения нарушены).",
        status: hasStars ? "normal" : "warning",
        icon: "⭐"
      },
      {
        name: "Зрелая эпоха звёздного коллапса и Жизни",
        time: `~ 1 – ${Math.min(100, Math.max(1, starLifeGyr))} млрд лет`,
        desc: `Время жизни солнцеподобных звёзд: ~${starLifeGyr} млрд лет. ${anthropic.fitness > 50 ? "Условия для разума и биосферы благоприятны." : "Зона неблагоприятна для развития сознания."}`,
        status: anthropic.fitness > 50 ? "success" : "warning",
        icon: "🧠"
      },
      {
        name: "Эра Чёрных Дыр и Испарение Хокинга",
        time: "> 10¹⁴ – 10¹⁰⁰ лет",
        desc: `Все обычные звёзды выгорают. Вселенная состоит из чёрных дыр, остывающих и взрывающихся через излучение Хокинга (TH ∝ 1/M).`,
        status: "normal",
        icon: "⏳"
      }
    ];

    let html = `<div class="timeline-track">`;
    epochs.forEach((ep, i) => {
      html += `
        <div class="timeline-step status-${ep.status}">
          <div class="timeline-node">
            <span class="timeline-icon">${ep.icon}</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-title">${ep.name}</span>
              <span class="timeline-badge">${ep.time}</span>
            </div>
            <p class="timeline-desc">${ep.desc}</p>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    this.container.innerHTML = html;
  }
}
