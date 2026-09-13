/**
 * CosmosBlackHole - Main Application Orchestrator
 * Connects physics calculations, 3D WebGL renderer, 2D phase diagrams,
 * charts, UI controls, LaTeX formula viewer, and export tools.
 */

import { REFERENCE_CONSTANTS } from './physics/constants.js';
import { calculateUniverse } from './physics/engine.js';
import { BlackHoleVisualizer } from './visualization/blackHoleRenderer.js';
import { PhaseDiagram } from './visualization/phaseDiagram.js';
import { MassSpectrumChart } from './visualization/massSpectrumChart.js';
import { TimelineVisualizer } from './visualization/timelineChart.js';
import { ControlsManager } from './ui/controls.js';
import { MetricsPanel } from './ui/metricsPanel.js';
import { FormulaViewer } from './ui/formulaViewer.js';
import { UniverseExporter } from './ui/exporter.js';

class CosmosApp {
  constructor() {
    this.currentConstants = { ...REFERENCE_CONSTANTS };
    this.refUniverseData = calculateUniverse(REFERENCE_CONSTANTS);
    this.currentUniverseData = this.refUniverseData;

    this.initVisualizers();
    this.initUI();
    this.initModals();
    this.updateAll(this.currentConstants);
  }

  initVisualizers() {
    // 1. 3D Black Hole Three.js
    const bhContainer = document.getElementById('bh-canvas-container');
    this.bhVisualizer = new BlackHoleVisualizer(bhContainer);

    // 2. 2D Phase Diagram
    const phaseCanvas = document.getElementById('phase-canvas');
    this.phaseDiagram = new PhaseDiagram(phaseCanvas);

    // 3. Mass Spectrum Chart
    const massCanvas = document.getElementById('mass-spectrum-canvas');
    this.massChart = new MassSpectrumChart(massCanvas);

    // 4. Cosmic Timeline
    const timelineContainer = document.getElementById('timeline-container');
    this.timelineVisualizer = new TimelineVisualizer(timelineContainer);
  }

  initUI() {
    // Metrics Panel
    const metricsContainer = document.getElementById('metrics-panel-container');
    this.metricsPanel = new MetricsPanel(metricsContainer);
    this.metricsPanel.setReferenceUniverse(this.refUniverseData);

    // Controls Manager (Sliders & Presets)
    const slidersContainer = document.getElementById('sliders-container');
    const presetsContainer = document.getElementById('presets-container');

    this.controls = new ControlsManager({
      containerElement: slidersContainer,
      presetsContainer: presetsContainer,
      onUpdate: (constants) => this.onConstantsChanged(constants)
    });

    // Reset All Button
    document.getElementById('btn-reset-all').addEventListener('click', () => {
      this.controls.resetAll();
    });

    // Tab Navigation
    const tabs = document.querySelectorAll('.vis-tab');
    const panes = document.querySelectorAll('.vis-pane');
    const bhControls = document.getElementById('bh-mass-controls');
    const phaseControls = document.getElementById('phase-controls');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        panes.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const tabKey = tab.getAttribute('data-tab');
        const activePane = document.getElementById(`pane-${tabKey}`);
        if (activePane) activePane.classList.add('active');

        // Context controls visibility
        if (tabKey === '3d-bh') {
          bhControls.style.display = 'flex';
          phaseControls.style.display = 'none';
          this.bhVisualizer.onResize();
        } else if (tabKey === 'phase-diagram') {
          bhControls.style.display = 'none';
          phaseControls.style.display = 'flex';
          this.phaseDiagram.setupResolution();
          this.phaseDiagram.render();
        } else if (tabKey === 'mass-spectrum') {
          bhControls.style.display = 'none';
          phaseControls.style.display = 'none';
          this.massChart.setupResolution();
          this.massChart.render();
        } else {
          bhControls.style.display = 'none';
          phaseControls.style.display = 'none';
        }
      });
    });

    // 3D Mass Selector Buttons
    const massButtons = document.querySelectorAll('[data-mass-mode]');
    massButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        massButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mass-mode');
        this.bhVisualizer.setMassMode(mode);
        this.bhVisualizer.updatePhysics(this.currentUniverseData);
      });
    });

    // Phase Diagram Mode Switcher
    const phaseButtons = document.querySelectorAll('[data-phase-mode]');
    phaseButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        phaseButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-phase-mode');
        this.phaseDiagram.setMode(mode);
      });
    });
  }

  initModals() {
    // 1. Scientific Dossier Modal
    const dossierModal = document.getElementById('modal-dossier');
    const dossierContent = document.getElementById('dossier-content');
    this.formulaViewer = new FormulaViewer(dossierContent);

    document.getElementById('btn-open-dossier').addEventListener('click', () => {
      dossierModal.style.display = 'flex';
    });

    // 2. Export Modal
    const exportModal = document.getElementById('modal-export');
    const exportPreview = document.getElementById('export-preview-text');

    document.getElementById('btn-open-export').addEventListener('click', () => {
      exportPreview.value = UniverseExporter.generateMarkdownReport(this.currentUniverseData);
      exportModal.style.display = 'flex';
    });

    // Close buttons for modals
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
      });
    });

    // Close on backdrop click
    [dossierModal, exportModal].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    });

    // Copy Markdown
    document.getElementById('btn-copy-md').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const text = exportPreview.value;
      await UniverseExporter.copyToClipboard(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="btn-icon">✓</span><span>Скопировано!</span>`;
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    });

    // Download JSON
    document.getElementById('btn-download-json').addEventListener('click', () => {
      const json = UniverseExporter.generateJSONReport(this.currentUniverseData);
      UniverseExporter.downloadFile('cosmos_universe_report.json', json, 'application/json');
    });

    // Print
    document.getElementById('btn-print').addEventListener('click', () => {
      window.print();
    });
  }

  onConstantsChanged(constants) {
    this.currentConstants = { ...constants };
    this.updateAll(this.currentConstants);
  }

  updateAll(constants) {
    this.currentUniverseData = calculateUniverse(constants);

    // Update Header Status Badge
    const headerText = document.getElementById('header-regime-text');
    const headerBadge = document.getElementById('header-regime-badge');
    if (headerText) headerText.textContent = this.currentUniverseData.anthropic.regime;
    if (headerBadge) {
      headerBadge.style.borderColor = this.currentUniverseData.anthropic.regimeColor;
      headerBadge.style.color = '#fff';
    }

    // Update Metrics
    this.metricsPanel.update(this.currentUniverseData);

    // Update Visualizers
    this.bhVisualizer.updatePhysics(this.currentUniverseData);
    this.phaseDiagram.update(this.currentUniverseData);
    this.massChart.update(this.currentUniverseData);
    this.timelineVisualizer.update(this.currentUniverseData);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new CosmosApp();
});
