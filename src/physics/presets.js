/**
 * CosmosBlackHole - Cosmological Universe Scenarios & Presets
 * Scientific presets representing distinct cosmological and astrophysical paradigms.
 */

import { REFERENCE_CONSTANTS } from './constants.js';

export const COSMOLOGICAL_PRESETS = [
  {
    id: "our_universe",
    name: "Наша Вселенная (ΛCDM)",
    subtitle: "Стандартная модель, умеренное число ЧД, жизнь и сознание",
    description: "Точные параметры нашей Вселенной согласно измерениям Planck 2018 и CODATA. Тонкая настройка констант обеспечивает существование углерода через резонанс Хойла, стабильные 10 млрд лет звёзды и умеренное образование ЧД.",
    icon: "🌌",
    constants: { ...REFERENCE_CONSTANTS }
  },
  {
    id: "smolin_cns",
    name: "Мультивселенная Смолина (CNS)",
    subtitle: "Космологический естественный отбор: максимальное размножение через ЧД",
    description: "Гипотеза Ли Смолина (Cosmological Natural Selection): параметры Вселенной оптимизированы для максимизации рождения дочерних Вселенных внутри сингулярностей чёрных дыр. Увеличены амплитуда первичных возмущений Q и гравитация G для форсирования звёздного и первичного коллапса.",
    icon: "♾️",
    constants: {
      ...REFERENCE_CONSTANTS,
      G: REFERENCE_CONSTANTS.G * 1.8,
      Q: REFERENCE_CONSTANTS.Q * 6.0,
      alpha: REFERENCE_CONSTANTS.alpha * 1.01
    }
  },
  {
    id: "early_crunch",
    name: "Гипергравитационный коллапс (Super-G)",
    subtitle: "Сверхмощное тяготение: вся материя сколлапсировала в ЧД",
    description: "Гравитационная постоянная G увеличена в 10 раз. Предел Чандрасекара и TOV резко падают. Звёзды вспыхивают с чудовищной светимостью и сгорают за считанные миллионы лет, оставляя после себя колоссальное скопление чёрных дыр до зарождения планетной жизни.",
    icon: "💥",
    constants: {
      ...REFERENCE_CONSTANTS,
      G: REFERENCE_CONSTANTS.G * 10.0,
      Lambda: REFERENCE_CONSTANTS.Lambda * 0.1
    }
  },
  {
    id: "starless_cold",
    name: "Беззвёздная холодная Вселенная",
    subtitle: "Слабая гравитация и доминирование темной энергии",
    description: "Ослабленный G (0.1x) и завышенная в 50 раз космологическая постоянная Λ. Газовые облака не способны преодолеть барьер Джинса, расширение пространства опережает гравитационную контракцию. Ни звёзд, ни звёздных ЧД не возникает.",
    icon: "🧊",
    constants: {
      ...REFERENCE_CONSTANTS,
      G: REFERENCE_CONSTANTS.G * 0.1,
      Lambda: REFERENCE_CONSTANTS.Lambda * 50.0,
      Q: REFERENCE_CONSTANTS.Q * 0.2
    }
  },
  {
    id: "pbh_dominated",
    name: "PBH-Доминантная Вселенная",
    subtitle: "Сверхвысокий Q: океан первичных чёрных дыр вместо обычной материи",
    description: "Амплитуда флуктуаций инфляции Q увеличена в 50 раз. По формализму Пресса-Шехтера экспоненциальная доля ранней плазмы при входе под горизонт сразу схлопывается в реликтовые чёрные дыры всех калибров (от микро-ЧД до сверхмассивных семян).",
    icon: "⚫",
    constants: {
      ...REFERENCE_CONSTANTS,
      Q: REFERENCE_CONSTANTS.Q * 50.0
    }
  },
  {
    id: "quantum_macro",
    name: "Квантово-доминантная Вселенная",
    subtitle: "Увеличенный ℏ: гигантские белые карлики и высочайший предел ЧД",
    description: "Постоянная Планка ℏ увеличена в 4 раза. Давление квантового вырождения фермионов колоссально возрастает: предел Чандрасекара вырастает до десятков солнечных масс. Образование чёрных дыр звездного коллапса крайне затруднено.",
    icon: "🔬",
    constants: {
      ...REFERENCE_CONSTANTS,
      hbar: REFERENCE_CONSTANTS.hbar * 4.0
    }
  },
  {
    id: "weakless_universe",
    name: "Вселенная без слабого взаимодействия",
    subtitle: "Модель Харника-Крибса-Переса: возможна ли жизнь и ЧД?",
    description: "Гипотетическая вселенная, где слабые ядерные взаимодействия подавлены или отсутствуют. Звёзды горят через прямой p-p захват и дейтериевые циклы, сверхновые типа II не имеют нейтринного ветра и коллапсируют в чёрные дыры напрямую.",
    icon: "⚛️",
    constants: {
      ...REFERENCE_CONSTANTS,
      alpha: REFERENCE_CONSTANTS.alpha * 0.98,
      mp: REFERENCE_CONSTANTS.mp * 1.05,
      me: REFERENCE_CONSTANTS.me * 0.90
    }
  }
];
