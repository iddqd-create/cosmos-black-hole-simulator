/**
 * CosmosBlackHole - Scientific Formula Viewer (KaTeX)
 * Displays rigorous first-principles physics derivations, equations, and literature citations.
 */

import katex from 'katex';
import 'katex/dist/katex.min.css';
import { SCIENTIFIC_DOSSIER } from '../physics/derivations.js';

export class FormulaViewer {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
  }

  renderMarkdownMath(text) {
    // Replace $$ math $$ display blocks
    let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
      } catch (err) {
        return `<pre class="math-error">${formula}</pre>`;
      }
    });

    // Replace $ math $ inline blocks
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
      } catch (err) {
        return `<code>${formula}</code>`;
      }
    });

    // Convert bold and paragraphs
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\n\n/g, '<br/><br/>');
    return processed;
  }

  render() {
    let html = `
      <div class="dossier-header">
        <div class="dossier-title-box">
          <span class="dossier-icon">📐</span>
          <h2 class="dossier-title">Научное досье: Фундаментальные формулы и первоисточники</h2>
        </div>
        <p class="dossier-subtitle">
          Строгие аналитические выводы пределов коллапса, формализма Пресса-Шехтера для PBH, 
          термодинамики Хокинга и антропного окна стабильности углеродной жизни.
        </p>
      </div>
      <div class="dossier-list">
    `;

    SCIENTIFIC_DOSSIER.forEach((item, index) => {
      const renderedFormula = katex.renderToString(item.latex, { displayMode: true, throwOnError: false });
      const renderedDerivation = this.renderMarkdownMath(item.derivation);

      html += `
        <article class="dossier-card" id="card-${item.id}">
          <div class="dossier-card-top">
            <span class="dossier-number">#0${index + 1}</span>
            <div class="dossier-meta">
              <h3 class="dossier-card-title">${item.title}</h3>
              <div class="dossier-author">${item.author}</div>
              <div class="dossier-ref">📖 ${item.reference}</div>
            </div>
          </div>

          <div class="dossier-formula-display">
            ${renderedFormula}
          </div>

          <div class="dossier-content-body">
            ${renderedDerivation}
          </div>
        </article>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
  }
}
