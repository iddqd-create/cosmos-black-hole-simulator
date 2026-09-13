/**
 * CosmosBlackHole - Controls UI Component
 * Handles constant sliders, numeric inputs, preset switching, and view modes.
 */

import { REFERENCE_CONSTANTS, CONSTANT_METADATA } from '../physics/constants.js';
import { COSMOLOGICAL_PRESETS } from '../physics/presets.js';

export class ControlsManager {
  constructor({ containerElement, presetsContainer, onUpdate, onMassModeChange }) {
    this.container = containerElement;
    this.presetsContainer = presetsContainer;
    this.onUpdate = onUpdate;
    this.onMassModeChange = onMassModeChange;

    this.currentConstants = { ...REFERENCE_CONSTANTS };
    this.renderPresets();
    this.renderSliders();
  }

  renderPresets() {
    if (!this.presetsContainer) return;
    let html = '';
    COSMOLOGICAL_PRESETS.forEach((preset) => {
      html += `
        <button class="preset-btn ${preset.id === 'our_universe' ? 'active' : ''}" data-preset-id="${preset.id}" title="${preset.subtitle}">
          <span class="preset-icon">${preset.icon}</span>
          <span class="preset-text">
            <span class="preset-title">${preset.name}</span>
          </span>
        </button>
      `;
    });
    this.presetsContainer.innerHTML = html;

    this.presetsContainer.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-preset-id');
        this.selectPreset(id);
      });
    });
  }

  selectPreset(presetId) {
    const preset = COSMOLOGICAL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    this.presetsContainer.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
    const activeBtn = this.presetsContainer.querySelector(`[data-preset-id="${presetId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    this.currentConstants = { ...preset.constants };
    this.updateSlidersFromCurrent();
    this.onUpdate(this.currentConstants);
  }

  renderSliders() {
    let html = '';
    Object.keys(CONSTANT_METADATA).forEach((key) => {
      const meta = CONSTANT_METADATA[key];
      const baseVal = REFERENCE_CONSTANTS[key];
      const currentVal = this.currentConstants[key];
      const ratio = currentVal / baseVal;
      const logVal = Math.log10(ratio);

      html += `
        <div class="control-card" data-constant="${key}">
          <div class="control-header">
            <div class="control-title-box">
              <span class="control-symbol">${meta.symbol}</span>
              <span class="control-name">${meta.name}</span>
            </div>
            <div class="control-values-box">
              <span class="control-ratio badge-${key}">${ratio >= 0.01 && ratio <= 100 ? ratio.toFixed(2) : ratio.toExponential(2)}×</span>
              <span class="control-abs abs-${key}">${currentVal.toExponential(3)} ${meta.unit}</span>
            </div>
          </div>
          <div class="slider-row">
            <input 
              type="range" 
              class="constant-slider" 
              data-constant="${key}"
              min="${meta.minExp}" 
              max="${meta.maxExp}" 
              step="${meta.step}" 
              value="${logVal.toFixed(3)}"
            />
          </div>
          <div class="control-footer">
            <span class="range-bound">10^${meta.minExp}×</span>
            <button class="btn-reset-single" data-reset="${key}" title="Сбросить к нашей Вселенной">1.0×</button>
            <span class="range-bound">10^${meta.maxExp}×</span>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = html;

    // Attach listeners
    this.container.querySelectorAll('.constant-slider').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const key = e.target.getAttribute('data-constant');
        const exp = parseFloat(e.target.value);
        const multiplier = Math.pow(10, exp);
        this.currentConstants[key] = REFERENCE_CONSTANTS[key] * multiplier;

        this.updateValueLabels(key, multiplier, this.currentConstants[key]);
        this.presetsContainer.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
        this.onUpdate(this.currentConstants);
      });
    });

    this.container.querySelectorAll('.btn-reset-single').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const key = e.target.getAttribute('data-reset');
        this.currentConstants[key] = REFERENCE_CONSTANTS[key];
        const slider = this.container.querySelector(`.constant-slider[data-constant="${key}"]`);
        if (slider) slider.value = "0";
        this.updateValueLabels(key, 1.0, REFERENCE_CONSTANTS[key]);
        this.onUpdate(this.currentConstants);
      });
    });
  }

  updateSlidersFromCurrent() {
    Object.keys(CONSTANT_METADATA).forEach((key) => {
      const baseVal = REFERENCE_CONSTANTS[key];
      const curVal = this.currentConstants[key];
      const ratio = curVal / baseVal;
      const logVal = Math.log10(ratio);

      const slider = this.container.querySelector(`.constant-slider[data-constant="${key}"]`);
      if (slider) slider.value = logVal.toFixed(3);

      this.updateValueLabels(key, ratio, curVal);
    });
  }

  updateValueLabels(key, ratio, absVal) {
    const meta = CONSTANT_METADATA[key];
    const badge = this.container.querySelector(`.badge-${key}`);
    const abs = this.container.querySelector(`.abs-${key}`);

    if (badge) {
      badge.textContent = `${ratio >= 0.01 && ratio <= 100 ? ratio.toFixed(2) : ratio.toExponential(2)}×`;
      if (Math.abs(ratio - 1.0) < 0.001) {
        badge.classList.remove('modified');
      } else {
        badge.classList.add('modified');
      }
    }
    if (abs) {
      abs.textContent = `${absVal.toExponential(3)} ${meta.unit}`;
    }
  }

  resetAll() {
    this.selectPreset('our_universe');
  }
}
