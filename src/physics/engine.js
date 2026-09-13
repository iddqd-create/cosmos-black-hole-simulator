/**
 * CosmosBlackHole - Scientific Physics Engine
 * Exact derivations of stellar limits, PBH abundance, Hawking evaporation,
 * and anthropic habitability criteria.
 */

import { REFERENCE_CONSTANTS, ASTRONOMICAL } from './constants.js';

// Error function helper for Press-Schechter integration
function erf(x) {
  // Abramowitz and Stegun approximation formula 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function erfc(x) {
  return 1.0 - erf(x);
}

/**
 * Calculates all astrophysical and cosmological consequences for a given set of constants
 * @param {Object} constants Current physical constants
 * @returns {Object} Full scientific model output
 */
export function calculateUniverse(constants) {
  const { G, c, hbar, alpha, mp, me, Lambda, Q, eta = REFERENCE_CONSTANTS.eta } = constants;
  const ref = REFERENCE_CONSTANTS;
  const astro = ASTRONOMICAL;

  // 1. Fundamental Ratios & Scalings
  const rG = G / ref.G;
  const rc = c / ref.c;
  const rhbar = hbar / ref.hbar;
  const ralpha = alpha / ref.alpha;
  const rmp = mp / ref.mp;
  const rme = me / ref.me;
  const rLambda = Lambda / ref.Lambda;
  const rQ = Q / ref.Q;

  // Gravitational coupling constant alpha_G = G * mp^2 / (hbar * c)
  const alpha_G = (G * mp * mp) / (hbar * c);
  const ref_alpha_G = (ref.G * ref.mp * ref.mp) / (ref.hbar * ref.c); // ~ 5.906e-39
  const rAlpha_G = alpha_G / ref_alpha_G;

  // Rees ratio N = alpha / alpha_G (electromagnetic to gravitational force between protons)
  const N_Rees = alpha / alpha_G;

  // Mass ratio proton to electron
  const mu_ratio = mp / me;

  // Planck units in this universe
  const M_pl = Math.sqrt((hbar * c) / G); // Planck mass (kg)
  const L_pl = Math.sqrt((hbar * G) / Math.pow(c, 3)); // Planck length (m)
  const t_pl = Math.sqrt((hbar * G) / Math.pow(c, 5)); // Planck time (s)

  // 2. Stellar Collapse Limits
  // Chandrasekhar mass M_Ch = omega3 * sqrt(3*pi)/2 * (hbar*c / G)^(3/2) * (1 / (mu_e * mp)^2)
  // Scaling: M_Ch proportional to (hbar*c/G)^(3/2) * mp^(-2) = alpha_G^(-3/2) * mp
  // Reference M_Ch is 1.44 M_sun
  const M_Ch_solar = 1.44 * Math.pow(rAlpha_G, -1.5) * rmp;
  const M_Ch_kg = M_Ch_solar * astro.M_sun;

  // Tolman-Oppenheimer-Volkoff (TOV) Limit (Maximum Neutron Star mass)
  // Scaling derived from nuclear equation of state with relativistic GR corrections:
  // M_TOV ~ 2.1 M_sun * (M_Ch / M_Ch0) * (c / c0)^0.5
  const M_TOV_solar = 2.16 * (M_Ch_solar / 1.44) * Math.sqrt(rc);
  const M_TOV_kg = M_TOV_solar * astro.M_sun;

  // Minimum stellar mass (hydrogen burning / brown dwarf limit)
  // M_min ~ 0.08 M_sun * (alpha / alpha0)^1.5 * (alpha_G0 / alpha_G)^1.5 * (me/me0)^-0.75 * (mp/mp0)^-0.25
  const M_min_star_solar = 0.08 * Math.pow(ralpha, 1.5) * Math.pow(rAlpha_G, -1.5) * Math.pow(rme, -0.75) * Math.pow(rmp, -0.25);

  // Maximum stable stellar mass (Eddington radiation pressure limit)
  // M_max ~ 150 M_sun * (alpha0 / alpha)^0.5 * (alpha_G0 / alpha_G)^1.5
  const M_max_star_solar = 150.0 * Math.pow(ralpha, -0.5) * Math.pow(rAlpha_G, -1.5);

  // Star existence check: can stable fusion stars exist?
  const starsCanForm = (M_min_star_solar < M_max_star_solar) && (M_min_star_solar > 0) && isFinite(M_min_star_solar);

  // Progenitor threshold for Stellar-mass Black Hole formation
  // Stars with mass > M_prog_BH collapse directly or via fallback into black holes
  // In our universe, M_prog_BH ~ 20 M_sun (solar metallicity) down to ~15 M_sun
  const M_prog_BH_solar = 20.0 * (M_TOV_solar / 2.16);

  // Stellar lifetime on Main Sequence for a 1 M_sun equivalent star
  // tau_* ~ 10^10 yr * (alpha0/alpha)^2 * (alpha_G0 / alpha_G) * (c0/c)^3 * (mp0/mp)
  const tau_star_years = 1.0e10 * Math.pow(ralpha, -2.0) * Math.pow(rAlpha_G, -1.0) * Math.pow(rc, -3.0) * Math.pow(rmp, -1.0);

  // 3. Black Hole Properties Functions
  // Schwarzschild radius: r_s = 2 G M / c^2
  const calcRs = (mass_kg) => (2.0 * G * mass_kg) / (c * c);
  
  // Photon sphere radius: r_ph = 1.5 * r_s
  const calcRph = (mass_kg) => 1.5 * calcRs(mass_kg);

  // ISCO radius (Innermost stable circular orbit for non-rotating Schwarzschild): 3 * r_s
  const calcISCO = (mass_kg) => 3.0 * calcRs(mass_kg);

  // Hawking Temperature: T_H = hbar * c^3 / (8 * pi * G * M * kB)
  const calcHawkingTemp = (mass_kg) => {
    if (mass_kg <= 0) return 0;
    return (hbar * Math.pow(c, 3)) / (8.0 * Math.PI * G * mass_kg * astro.kB);
  };

  // Hawking Evaporation Lifetime: tau_evap = 5120 * pi * G^2 * M^3 / (hbar * c^4) in seconds
  const calcHawkingLifetime = (mass_kg) => {
    if (mass_kg <= 0) return 0;
    const tau_sec = (5120.0 * Math.PI * G * G * Math.pow(mass_kg, 3)) / (hbar * Math.pow(c, 4));
    return tau_sec / astro.year; // in years
  };

  // Threshold mass of PBH evaporating by the age of the Universe (13.8 Gyr)
  // M_evap_today = (hbar * c^4 * t_0 / (5120 * pi * G^2))^(1/3)
  const t_age_sec = astro.universe_age * astro.year;
  const M_pbh_evap_today_kg = Math.pow((hbar * Math.pow(c, 4) * t_age_sec) / (5120.0 * Math.PI * G * G), 1.0 / 3.0);

  // 4. Primordial Black Holes (PBH) - Press-Schechter & Horizon Collapse
  // Critical overdensity delta_c for gravitational collapse at horizon crossing during radiation era
  // Standard Carr-Hawking-Musco threshold: delta_c ~ 0.45
  const delta_c = 0.45;
  // Variance of primordial fluctuations on horizon scale:
  // Calibrated to inflation peak spectrum with fiducial baseline sigma_0 ~ 0.04 (Carr & Hawking 1974)
  const sigma_Q = 0.04 * (Q / ref.Q);
  
  // Fraction of horizon volume collapsing into PBH: beta = erfc(delta_c / (sqrt(2) * sigma_Q))
  // With numerical safeguard for extreme tail
  const x_tail = delta_c / (Math.SQRT2 * sigma_Q);
  let beta_PBH = 0;
  if (x_tail < 0.1) {
    beta_PBH = 1.0; // Total universe collapse into PBHs
  } else if (x_tail > 30.0) {
    // Ultra-rare, use asymptotic expansion: erfc(x) ~ exp(-x^2)/(x * sqrt(pi))
    const logBeta = -x_tail * x_tail - Math.log(x_tail * Math.sqrt(Math.PI));
    beta_PBH = logBeta < -300 ? 0 : Math.exp(logBeta);
  } else {
    beta_PBH = erfc(x_tail);
  }

  // Abundance of PBH relative to critical density: Omega_PBH ~ beta * (1 + z_eq)
  // z_eq ~ 3400 in standard cosmology, scales with (eta * mp / c^2)
  const z_eq = 3400 * (eta / ref.eta) * rmp;
  const Omega_PBH = Math.min(1e10, beta_PBH * z_eq * (Q / ref.Q));

  // 5. Total Black Hole Production Rates (Smolin Cosmological Natural Selection Index)
  // Stellar BH production rate: depends on star formation rate (scaled by Q^2 and Jeans timescale)
  // and fraction of IMF above M_prog_BH
  let stellar_BH_efficiency = 0;
  if (starsCanForm && M_prog_BH_solar < M_max_star_solar) {
    // Salpeter Initial Mass Function: dN/dM ~ M^-2.35
    // Integrate from M_prog to M_max vs M_min to M_max
    const imf_upper = Math.pow(M_prog_BH_solar, -1.35) - Math.pow(M_max_star_solar, -1.35);
    const imf_total = Math.pow(M_min_star_solar, -1.35) - Math.pow(M_max_star_solar, -1.35);
    const imf_fraction = Math.max(0, Math.min(1, imf_upper / imf_total));
    // Rate scaled by star formation efficiency and cosmic time
    stellar_BH_efficiency = imf_fraction * Math.min(10, Math.pow(rQ, 2.0) * Math.sqrt(rG));
  }

  // Smolin CNS Fitness: combination of stellar BHs and non-catastrophic PBH creation
  // If beta_PBH is too large (> 0.01), early universe collapses before stars can evolve, which Smolin argued drops fitness
  let smolin_CNS_index = 0;
  if (beta_PBH > 0.05) {
    smolin_CNS_index = Math.max(0, 100 * Math.exp(-(beta_PBH - 0.05) * 20)); // Collapsed into Big Crunch/PBH soup
  } else {
    smolin_CNS_index = Math.min(100, (stellar_BH_efficiency * 50 + beta_PBH * 1e18 * 50));
  }

  // 6. Anthropic Habitability Criteria (Life & Consciousness)
  // Check A: Hoyle State Resonance (Carbon / Oxygen nucleosynthesis)
  // The 7.654 MeV 0+ level of 12C requires alpha to be tuned within ~ 2-3%
  const alpha_deviation = Math.abs(ralpha - 1.0);
  let score_hoyle = 0;
  if (alpha_deviation <= 0.02) {
    score_hoyle = 1.0 - (alpha_deviation / 0.02) * 0.5;
  } else if (alpha_deviation <= 0.05) {
    score_hoyle = 0.5 * (1.0 - (alpha_deviation - 0.02) / 0.03);
  } else {
    score_hoyle = 0.0;
  }

  // Check B: Stable Atoms and Chemistry
  // Need alpha < 1, me << mp, and protons stable against decay into neutrons
  let score_atoms = 1.0;
  if (alpha > 0.1) score_atoms *= Math.max(0, 1.0 - (alpha - 0.1) * 2.0);
  if (mu_ratio < 100 || mu_ratio > 5000) score_atoms *= 0.2;

  // Check C: Stellar Lifetime & Planetary Habitability for Evolution of Complex Life
  // Requires at least 1.5 - 2.0 billion years of steady stellar burning
  let score_lifetime = 0.0;
  if (tau_star_years >= 2.0e9) {
    score_lifetime = Math.min(1.0, Math.log10(tau_star_years / 1.0e8) / 2.0);
  } else if (tau_star_years >= 5.0e8) {
    score_lifetime = 0.5 * ((tau_star_years - 5.0e8) / 1.5e9);
  } else {
    score_lifetime = 0.0; // Stars burn out too fast for consciousness
  }

  // Check C2: Planetary surface gravity / structural biological limit
  // High G crushes multicellular organisms (Carter/Press 1983)
  let score_biomechanics = 1.0;
  if (rG > 2.0) {
    score_biomechanics = Math.max(0.05, 1.0 / Math.pow(rG / 2.0, 1.2));
  } else if (rG < 0.2) {
    score_biomechanics = Math.max(0.1, rG / 0.2); // planets cannot retain atmosphere
  }

  // Check D: Cosmological Expansion & Structure Formation
  // Weinberg bound: Lambda cannot dominate before galaxies collapse (Lambda < ~ 100 * Lambda_0)
  // Q cannot be too small (no structures) or too large (SMBHs swallow all disks)
  let score_cosmo = 1.0;
  if (rLambda > 100.0) {
    score_cosmo *= Math.max(0, 1.0 - Math.log10(rLambda / 100.0) / 2.0);
  }
  if (rQ < 0.1) {
    score_cosmo *= Math.max(0, rQ / 0.1);
  } else if (rQ > 50.0) {
    score_cosmo *= Math.max(0, 1.0 - Math.log10(rQ / 50.0) / 2.0);
  }

  // Check E: Star Formation Window
  let score_stars = 0.0;
  if (starsCanForm) {
    const ratio_window = M_max_star_solar / Math.max(1e-4, M_min_star_solar);
    score_stars = ratio_window > 10 ? 1.0 : ratio_window / 10.0;
  }

  // Total Anthropic Fitness (0 - 100%)
  const anthropic_fitness = (score_hoyle * score_atoms * score_lifetime * score_biomechanics * score_cosmo * score_stars) * 100.0;

  // Universe Classification
  let regime = "Стабильная вселенная (тип Нашей Вселенной)";
  let regimeDetails = "Поддерживает звёздный нуклеосинтез, углеродную химию, умеренное образование черных дыр и жизнь.";
  let regimeColor = "#00e5ff";

  if (beta_PBH > 0.01) {
    regime = "PBH-коллапс (Вселенная первичных чёрных дыр)";
    regimeDetails = "Флуктуации инфляции столь велики, что ранняя материя почти целиком сколлапсировала в первичные ЧД.";
    regimeColor = "#ff2a5f";
  } else if (!starsCanForm || score_stars === 0) {
    regime = "Беззвёздная вселенная (Холодный газ)";
    regimeDetails = "Минимальная масса устойчивого горения превышает порог Эддингтона. Звёзды не способны стабильно светить.";
    regimeColor = "#7986cb";
  } else if (rLambda > 500) {
    regime = "Сверхбыстрое экспоненциальное расширение";
    regimeDetails = "Тёмная энергия разорвала гравитационные связи до образования галактик и протозвездных облаков.";
    regimeColor = "#ba68c8";
  } else if (tau_star_years < 2.0e8) {
    regime = "Гипергравитационная короткоживущая Вселенная";
    regimeDetails = "Гравитация столь сильна, что звёзды сгорают за миллионы лет и мгновенно коллапсируют в чёрные дыры.";
    regimeColor = "#ff9100";
  } else if (anthropic_fitness > 75) {
    regime = "Антропная зона (Жизнь и Сознание)";
    regimeDetails = "Сбалансированные фундаментальные константы: активная астрофизика, стабильные планеты, долгоживущие звёзды.";
    regimeColor = "#00e676";
  }

  return {
    constants,
    scalings: {
      rG, rc, rhbar, ralpha, rmp, rme, rLambda, rQ, rAlpha_G
    },
    dimensionless: {
      alpha_G,
      ref_alpha_G,
      N_Rees,
      mu_ratio,
      alpha
    },
    planck: {
      M_pl,
      L_pl,
      t_pl
    },
    stellar: {
      M_Ch_solar,
      M_Ch_kg,
      M_TOV_solar,
      M_TOV_kg,
      M_min_star_solar,
      M_max_star_solar,
      M_prog_BH_solar,
      starsCanForm,
      tau_star_years,
      stellar_BH_efficiency
    },
    pbh: {
      delta_c,
      sigma_Q,
      beta_PBH,
      Omega_PBH,
      M_pbh_evap_today_kg
    },
    anthropic: {
      fitness: anthropic_fitness,
      score_hoyle,
      score_atoms,
      score_lifetime,
      score_cosmo,
      score_stars,
      regime,
      regimeDetails,
      regimeColor
    },
    smolin: {
      fitness: smolin_CNS_index
    },
    blackHoleFunctions: {
      calcRs,
      calcRph,
      calcISCO,
      calcHawkingTemp,
      calcHawkingLifetime
    }
  };
}
