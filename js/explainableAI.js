/* ============================================================
   Explainable AI Module — SHAP Values & Feature Importance
   ============================================================ */

const shapData = {
  Diabetes: {
    features: ['Glucose', 'BMI', 'Age', 'Insulin', 'Blood Pressure', 'Pregnancies', 'Pedigree Function', 'Skin Thickness'],
    shap: [0.42, 0.28, 0.18, 0.12, -0.08, -0.05, 0.15, -0.03],
    importance: [0.32, 0.22, 0.15, 0.10, 0.07, 0.05, 0.06, 0.03]
  },
  'Heart Disease': {
    features: ['Chest Pain', 'Max HR', 'ST Depression', 'Age', 'Cholesterol', 'Resting BP', 'ECG', 'Exercise Angina', 'Sex', 'Major Vessels', 'Fasting BS'],
    shap: [0.35, -0.25, 0.22, 0.18, 0.14, 0.10, 0.08, 0.20, 0.06, 0.12, -0.04],
    importance: [0.20, 0.15, 0.13, 0.12, 0.10, 0.08, 0.06, 0.07, 0.04, 0.03, 0.02]
  },
  'Liver Disease': {
    features: ['Total Bilirubin', 'ALT', 'AST', 'ALP', 'Albumin', 'Direct Bilirubin', 'Total Proteins', 'A/G Ratio'],
    shap: [0.38, 0.25, 0.22, 0.15, -0.18, 0.12, -0.10, -0.08],
    importance: [0.25, 0.18, 0.16, 0.12, 0.10, 0.08, 0.06, 0.05]
  },
  Stroke: {
    features: ['Age', 'Hypertension', 'Heart Disease', 'Glucose', 'Smoking', 'BMI', 'Gender', 'Work Stress'],
    shap: [0.35, 0.30, 0.22, 0.18, 0.15, 0.10, 0.05, -0.03],
    importance: [0.22, 0.20, 0.16, 0.14, 0.10, 0.08, 0.06, 0.04]
  }
};

function initExplainableAI() {
  const container = document.getElementById('explainableAI-content');
  if (!container) return;

  const diseases = Object.keys(shapData);

  container.innerHTML = `
    <!-- Disease Selector -->
    <div class="filter-bar">
      <div class="form-group" style="min-width: 220px;">
        <label class="form-label" for="xai-disease-select">Select Disease Model</label>
        <select class="form-select" id="xai-disease-select">
          ${diseases.map(d => `<option value="${d}">${d}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <div class="tab active" data-tab="shap">SHAP Values</div>
      <div class="tab" data-tab="importance">Feature Importance</div>
    </div>

    <!-- SHAP Tab -->
    <div class="tab-content active" id="tab-shap">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">SHAP Waterfall Chart</div>
            <div class="glass-card-subtitle">How each feature pushes the prediction higher (red) or lower (blue)</div>
          </div>
        </div>
        <div class="shap-chart-container" id="shap-waterfall"></div>
        <div class="mt-lg" style="padding: var(--space-md); background: hsla(222, 40%, 14%, 0.4); border-radius: var(--radius-md);">
          <p class="text-sm text-secondary" style="line-height: 1.8;">
            <strong style="color: var(--accent-cyan);">How to read this chart:</strong> Each bar represents a feature's contribution (SHAP value) to the model's prediction.
            <span style="color: var(--status-danger);">Red bars</span> push the prediction toward higher risk, while
            <span style="color: var(--status-info);">blue bars</span> push it toward lower risk. Longer bars indicate stronger influence.
          </p>
        </div>
      </div>
    </div>

    <!-- Feature Importance Tab -->
    <div class="tab-content" id="tab-importance">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Feature Importance Rankings</div>
            <div class="glass-card-subtitle">Relative importance of each feature in the model</div>
          </div>
        </div>
        <div class="chart-container tall">
          <canvas id="chart-feature-importance"></canvas>
        </div>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Tab switching
  container.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
      renderXAI();
    });
  });

  // Disease selector
  document.getElementById('xai-disease-select').addEventListener('change', renderXAI);

  renderXAI();
}

function renderXAI() {
  const disease = document.getElementById('xai-disease-select').value;
  const data = shapData[disease];
  if (!data) return;

  renderSHAPWaterfall(data);
  renderFeatureImportanceChart(data);
}

function renderSHAPWaterfall(data) {
  const container = document.getElementById('shap-waterfall');
  if (!container) return;

  const maxAbs = Math.max(...data.shap.map(Math.abs));

  // Sort by absolute value descending
  const indexed = data.features.map((f, i) => ({ feature: f, shap: data.shap[i] }));
  indexed.sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));

  let html = '<div class="shap-chart-container" style="position:relative;">';

  indexed.forEach(item => {
    const isPositive = item.shap >= 0;
    const width = (Math.abs(item.shap) / maxAbs * 45).toFixed(1);
    const colorClass = isPositive ? 'positive' : 'negative';

    html += `
      <div class="shap-bar">
        <span class="shap-feature">${item.feature}</span>
        <div class="shap-bar-track">
          <div class="shap-bar-fill ${colorClass}" style="width: ${width}%;"></div>
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--glass-border);"></div>
        </div>
        <span class="shap-value ${colorClass}">${isPositive ? '+' : ''}${item.shap.toFixed(3)}</span>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // Animate bars in
  setTimeout(() => {
    container.querySelectorAll('.shap-bar-fill').forEach((bar, i) => {
      bar.style.transition = `width 0.6s ease ${i * 0.08}s`;
    });
  }, 50);
}

function renderFeatureImportanceChart(data) {
  const ctx = document.getElementById('chart-feature-importance');
  if (!ctx) return;
  window.HealthAI.destroyChart('featureImportance');

  // Sort by importance descending
  const indexed = data.features.map((f, i) => ({ feature: f, importance: data.importance[i] }));
  indexed.sort((a, b) => b.importance - a.importance);

  const gradient = indexed.map((_, i) => {
    const ratio = i / (indexed.length - 1 || 1);
    const h = 174 + ratio * 90; // cyan to purple
    return `hsl(${h}, 70%, 55%)`;
  });

  window.HealthAI.charts['featureImportance'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: indexed.map(e => e.feature),
      datasets: [{
        label: 'Importance Score',
        data: indexed.map(e => (e.importance * 100).toFixed(1)),
        backgroundColor: gradient.map(c => c.replace(')', ', 0.5)').replace('hsl', 'hsla')),
        borderColor: gradient,
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 40, title: { display: true, text: 'Importance (%)' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}
