/**
 * Automated Verification Test Suite for CosmosBlackHole Physics Engine
 */

import { REFERENCE_CONSTANTS, ASTRONOMICAL } from '../src/physics/constants.js';
import { calculateUniverse } from '../src/physics/engine.js';
import { COSMOLOGICAL_PRESETS } from '../src/physics/presets.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

function assertClose(actual, expected, tolerancePercent, message) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  const allowed = Math.abs(expected) * (tolerancePercent / 100);
  if (diff > allowed) {
    console.error(`❌ FAILED: ${message} (Expected ~${expected}, Got ${actual}, Diff ${diff} > ${allowed})`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message} (${actual})`);
    passedTests++;
  }
}

console.log("\n=========================================");
console.log("  RUNNING COSMOS PHYSICS ENGINE TESTS");
console.log("=========================================\n");

// 1. Benchmark: Our Universe
const ourUniverse = calculateUniverse(REFERENCE_CONSTANTS);

// Chandrasekhar Mass should be ~ 1.44 M_sun
assertClose(ourUniverse.stellar.M_Ch_solar, 1.44, 2.0, "Chandrasekhar limit for Our Universe ~ 1.44 M_sun");

// TOV Limit should be ~ 2.16 M_sun
assertClose(ourUniverse.stellar.M_TOV_solar, 2.16, 2.0, "TOV limit for Our Universe ~ 2.16 M_sun");

// Minimum stable star mass should be ~ 0.08 M_sun (Brown dwarf limit)
assertClose(ourUniverse.stellar.M_min_star_solar, 0.08, 5.0, "Minimum stellar fusion mass ~ 0.08 M_sun");

// Maximum stellar mass ~ 150 M_sun (Eddington radiation limit)
assertClose(ourUniverse.stellar.M_max_star_solar, 150.0, 5.0, "Eddington stellar mass limit ~ 150 M_sun");

// Schwarzschild radius for 10 M_sun should be ~ 29.53 km
const rs_10M = ourUniverse.blackHoleFunctions.calcRs(10 * ASTRONOMICAL.M_sun) / 1000;
assertClose(rs_10M, 29.53, 1.0, "Schwarzschild radius for 10 M_sun ~ 29.5 km");

// Photon sphere should be exactly 1.5 * rs
const rph_10M = ourUniverse.blackHoleFunctions.calcRph(10 * ASTRONOMICAL.M_sun) / 1000;
assertClose(rph_10M, rs_10M * 1.5, 0.01, "Photon sphere radius = 1.5 * r_s");

// Gravitational coupling alpha_G ~ 5.9e-39
assertClose(ourUniverse.dimensionless.alpha_G, 5.906e-39, 1.0, "Gravitational coupling alpha_G ~ 5.906e-39");

// Rees ratio N = alpha / alpha_G ~ 1.23e36
assertClose(ourUniverse.dimensionless.N_Rees, 1.23e36, 2.0, "Rees number N ~ 1.23e36");

// Main sequence lifetime for 1 M_sun ~ 10 Gyr
assertClose(ourUniverse.stellar.tau_star_years, 1.0e10, 2.0, "Solar lifetime ~ 10 billion years");

// Anthropic Fitness of Our Universe should be very high (>= 90%)
assert(ourUniverse.anthropic.fitness >= 90.0, `Anthropic fitness of Our Universe is high (${ourUniverse.anthropic.fitness.toFixed(1)}%)`);

// 2. Scenario: Super-G (10x G)
const superG = calculateUniverse({
  ...REFERENCE_CONSTANTS,
  G: REFERENCE_CONSTANTS.G * 10.0
});
// When G is 10x, Chandrasekhar mass drops by ~ 10^(1.5) = 31.6x
assert(superG.stellar.M_Ch_solar < ourUniverse.stellar.M_Ch_solar, "Super-G decreases Chandrasekhar mass dramatically");
// Stellar lifetime drops drastically
assert(superG.stellar.tau_star_years < 1e9, "Super-G stars burn out too quickly for complex life evolution");
assert(superG.anthropic.fitness < 20, "Super-G is hostile to consciousness/anthropic life");

// 3. Scenario: High Q (PBH collapse)
const highQ = calculateUniverse({
  ...REFERENCE_CONSTANTS,
  Q: REFERENCE_CONSTANTS.Q * 50.0
});
assert(highQ.pbh.beta_PBH > 0.01, "High Q leads to massive primordial black hole formation fraction");

// 4. Test Presets validity
COSMOLOGICAL_PRESETS.forEach(preset => {
  const sim = calculateUniverse(preset.constants);
  assert(sim && sim.stellar && isFinite(sim.stellar.M_Ch_solar), `Preset '${preset.name}' computes valid physics`);
});

console.log(`\n=========================================`);
console.log(`  ALL ${passedTests}/${totalTests} TESTS PASSED WITH SCIENTIFIC PRECISION!`);
console.log(`=========================================\n`);
