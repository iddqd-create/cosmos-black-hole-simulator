/**
 * CosmosBlackHole - Fundamental Constants of Our Universe
 * Sources: CODATA 2018, Planck Collaboration 2018, Particle Data Group 2022
 */

export const REFERENCE_CONSTANTS = {
  // Speed of light in vacuum (m/s)
  c: 2.99792458e8,
  
  // Newton's Gravitational constant (m^3 / (kg * s^2))
  G: 6.67430e-11,
  
  // Reduced Planck constant (J * s = kg * m^2 / s)
  hbar: 1.054571817e-34,
  
  // Fine structure constant (dimensionless) ~ 1/137.035999
  alpha: 7.297352569e-3,
  
  // Proton mass (kg)
  mp: 1.67262192369e-27,
  
  // Electron mass (kg)
  me: 9.1093837015e-31,
  
  // Cosmological constant Lambda (m^-2)
  Lambda: 1.1056e-52,
  
  // Primordial density perturbation amplitude Q (dimensionless)
  Q: 2.0e-5,
  
  // Baryon-to-photon ratio eta (dimensionless)
  eta: 6.1e-10
};

export const ASTRONOMICAL = {
  // Solar mass (kg)
  M_sun: 1.98847e30,
  
  // Solar radius (m)
  R_sun: 6.957e8,
  
  // Solar luminosity (Watts)
  L_sun: 3.828e26,
  
  // One year in seconds
  year: 3.15576e7,
  
  // Age of our Universe in years
  universe_age: 13.787e9,
  
  // Hubble parameter H0 in s^-1 (~ 67.4 km/s/Mpc)
  H0: 2.184e-18,
  
  // Boltzmann constant (J/K)
  kB: 1.380649e-23,

  // Speed of light squared
  c2: Math.pow(2.99792458e8, 2)
};

export const CONSTANT_METADATA = {
  G: {
    name: "Гравитационная постоянная",
    symbol: "G",
    unit: "м³/(кг·с²)",
    description: "Определяет интенсивность гравитационного притяжения и кривизну пространства-времени.",
    latex: "G",
    minExp: -2,  // 0.01x
    maxExp: 2,   // 100x
    defaultExp: 0,
    step: 0.02
  },
  c: {
    name: "Скорость света в вакууме",
    symbol: "c",
    unit: "м/с",
    description: "Предельная скорость передачи взаимодействий, связывает массу и энергию (E=mc²).",
    latex: "c",
    minExp: -1,  // 0.1x
    maxExp: 1,   // 10x
    defaultExp: 0,
    step: 0.02
  },
  hbar: {
    name: "Приведённая постоянная Планка",
    symbol: "ℏ",
    unit: "Дж·с",
    description: "Квант действия, определяет масштабы неопределенности и давление вырождения фермионов.",
    latex: "\\hbar",
    minExp: -2,
    maxExp: 2,
    defaultExp: 0,
    step: 0.02
  },
  alpha: {
    name: "Постоянная тонкой структуры",
    symbol: "α",
    unit: "безразмерная",
    description: "Сила электромагнитного взаимодействия, определяет размеры атомов, химию и ядерный синтез.",
    latex: "\\alpha",
    minExp: -1.5,
    maxExp: 1.5,
    defaultExp: 0,
    step: 0.02
  },
  mp: {
    name: "Масса покоя протона",
    symbol: "m_p",
    unit: "кг",
    description: "Масса основного бариона, определяет плотность вещества и гравитационный вес звездных ядер.",
    latex: "m_p",
    minExp: -1.5,
    maxExp: 1.5,
    defaultExp: 0,
    step: 0.02
  },
  me: {
    name: "Масса покоя электрона",
    symbol: "m_e",
    unit: "кг",
    description: "Определяет радиус Бора, масштаб атомов и релятивистский порог электронного вырождения.",
    latex: "m_e",
    minExp: -1.5,
    maxExp: 1.5,
    defaultExp: 0,
    step: 0.02
  },
  Lambda: {
    name: "Космологическая постоянная",
    symbol: "Λ",
    unit: "м⁻²",
    description: "Плотность темной энергии вакуума, вызывает ускоренное расширение Вселенной.",
    latex: "\\Lambda",
    minExp: -3,
    maxExp: 4,
    defaultExp: 0,
    step: 0.05
  },
  Q: {
    name: "Амплитуда первичных возмущений",
    symbol: "Q",
    unit: "безразмерная",
    description: "Амплитуда флуктуаций плотности после инфляции (δρ/ρ), семена галактик и первичных ЧД.",
    latex: "Q",
    minExp: -2,
    maxExp: 3,
    defaultExp: 0,
    step: 0.05
  }
};
