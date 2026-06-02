/* ============================================================
   Stroke Prediction Module
   ============================================================ */

function initStroke() {
  const container = document.getElementById('stroke-content');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-2">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Stroke Risk Parameters</div>
            <div class="glass-card-subtitle">Enter patient data for cerebrovascular risk evaluation</div>
          </div>
        </div>
        <form id="stroke-form" class="form-grid" autocomplete="off">
          <div class="form-group">
            <label class="form-label" for="sk-gender">Gender</label>
            <select class="form-select" id="sk-gender">
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-age">Age <span class="unit">(years)</span></label>
            <input type="number" class="form-input" id="sk-age" min="18" max="120" value="55">
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-hypertension">Hypertension</label>
            <select class="form-select" id="sk-hypertension">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-heartdisease">Heart Disease</label>
            <select class="form-select" id="sk-heartdisease">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-married">Ever Married</label>
            <select class="form-select" id="sk-married">
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-work">Work Type</label>
            <select class="form-select" id="sk-work">
              <option value="private">Private</option>
              <option value="selfemployed">Self-Employed</option>
              <option value="govt">Government</option>
              <option value="children">Children</option>
              <option value="never">Never Worked</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-residence">Residence Type</label>
            <select class="form-select" id="sk-residence">
              <option value="urban">Urban</option>
              <option value="rural">Rural</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-glucose">Avg Glucose Level <span class="unit">(mg/dL)</span></label>
            <input type="number" class="form-input" id="sk-glucose" min="50" max="300" step="0.1" value="100">
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-bmi">BMI <span class="unit">(kg/m²)</span></label>
            <input type="number" class="form-input" id="sk-bmi" min="10" max="70" step="0.1" value="26.0">
          </div>
          <div class="form-group">
            <label class="form-label" for="sk-smoking">Smoking Status</label>
            <select class="form-select" id="sk-smoking">
              <option value="never">Never Smoked</option>
              <option value="formerly">Formerly Smoked</option>
              <option value="smokes">Smokes</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </form>
        <div class="mt-xl btn-group">
          <button class="btn btn-primary btn-lg" id="stroke-predict-btn">
            <i data-lucide="scan"></i> Predict Risk
          </button>
          <button class="btn btn-secondary" id="stroke-reset-btn">
            <i data-lucide="rotate-ccw"></i> Reset
          </button>
        </div>
      </div>

      <div id="stroke-results">
        <div class="glass-card">
          <div class="empty-state">
            <i data-lucide="brain"></i>
            <p>Enter stroke risk parameters and click <strong>Predict Risk</strong>.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2 mt-xl" id="stroke-charts-row" style="display:none;">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Risk Factor Contributions</div>
            <div class="glass-card-subtitle">Individual impact on stroke risk</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-stroke-factors"></canvas>
        </div>
      </div>
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Modifiable vs Non-Modifiable</div>
            <div class="glass-card-subtitle">Risk factors you can and cannot change</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-stroke-modifiable"></canvas>
        </div>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('stroke-predict-btn').addEventListener('click', predictStroke);
  document.getElementById('stroke-reset-btn').addEventListener('click', () => {
    document.getElementById('stroke-form').reset();
    document.getElementById('stroke-results').innerHTML = `
      <div class="glass-card"><div class="empty-state">
        <i data-lucide="brain"></i>
        <p>Enter stroke risk parameters and click <strong>Predict Risk</strong>.</p>
      </div></div>`;
    document.getElementById('stroke-charts-row').style.display = 'none';
    window.HealthAI.destroyChart('strokeFactors');
    window.HealthAI.destroyChart('strokeModifiable');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

function predictStroke() {
  const vals = {
    gender: +document.getElementById('sk-gender').value,
    age: +document.getElementById('sk-age').value,
    hypertension: +document.getElementById('sk-hypertension').value,
    heartDisease: +document.getElementById('sk-heartdisease').value,
    married: +document.getElementById('sk-married').value,
    work: document.getElementById('sk-work').value,
    residence: document.getElementById('sk-residence').value,
    glucose: +document.getElementById('sk-glucose').value,
    bmi: +document.getElementById('sk-bmi').value,
    smoking: document.getElementById('sk-smoking').value
  };

  let score = 0;
  const factors = {};
  const modifiable = {};
  const nonModifiable = {};

  // Age (20%) — non-modifiable
  if (vals.age > 70) { score += 20; factors.Age = 20; nonModifiable.Age = 20; }
  else if (vals.age > 60) { score += 15; factors.Age = 15; nonModifiable.Age = 15; }
  else if (vals.age > 50) { score += 10; factors.Age = 10; nonModifiable.Age = 10; }
  else if (vals.age > 40) { score += 5; factors.Age = 5; nonModifiable.Age = 5; }
  else { factors.Age = 2; score += 2; nonModifiable.Age = 2; }

  // Hypertension (18%) — modifiable
  if (vals.hypertension === 1) { score += 18; factors.Hypertension = 18; modifiable.Hypertension = 18; }
  else { factors.Hypertension = 1; score += 1; modifiable.Hypertension = 1; }

  // Heart Disease (15%) — non-modifiable (condition)
  if (vals.heartDisease === 1) { score += 15; factors['Heart Disease'] = 15; nonModifiable['Heart Disease'] = 15; }
  else { factors['Heart Disease'] = 1; score += 1; nonModifiable['Heart Disease'] = 1; }

  // Glucose (15%) — modifiable
  if (vals.glucose > 200) { score += 15; factors.Glucose = 15; modifiable.Glucose = 15; }
  else if (vals.glucose > 140) { score += 10; factors.Glucose = 10; modifiable.Glucose = 10; }
  else if (vals.glucose > 100) { score += 5; factors.Glucose = 5; modifiable.Glucose = 5; }
  else { factors.Glucose = 1; score += 1; modifiable.Glucose = 1; }

  // BMI (10%) — modifiable
  if (vals.bmi > 35) { score += 10; factors.BMI = 10; modifiable.BMI = 10; }
  else if (vals.bmi > 30) { score += 7; factors.BMI = 7; modifiable.BMI = 7; }
  else if (vals.bmi > 25) { score += 4; factors.BMI = 4; modifiable.BMI = 4; }
  else { factors.BMI = 1; score += 1; modifiable.BMI = 1; }

  // Smoking (12%) — modifiable
  if (vals.smoking === 'smokes') { score += 12; factors.Smoking = 12; modifiable.Smoking = 12; }
  else if (vals.smoking === 'formerly') { score += 6; factors.Smoking = 6; modifiable.Smoking = 6; }
  else { factors.Smoking = 1; score += 1; modifiable.Smoking = 1; }

  // Gender (5%) — non-modifiable
  if (vals.gender === 1) { score += 5; factors.Gender = 5; nonModifiable.Gender = 5; }
  else { factors.Gender = 3; score += 3; nonModifiable.Gender = 3; }

  // Work Type (3%)
  if (vals.work === 'selfemployed') { score += 3; factors['Work Stress'] = 3; modifiable['Work Stress'] = 3; }
  else if (vals.work === 'private') { score += 2; factors['Work Stress'] = 2; modifiable['Work Stress'] = 2; }
  else { factors['Work Stress'] = 1; score += 1; modifiable['Work Stress'] = 1; }

  // Residence (2%)
  if (vals.residence === 'urban') { score += 2; factors.Residence = 2; }
  else { factors.Residence = 1; score += 1; }

  const riskScore = Math.min(score, 100);
  const risk = getRiskLevel(riskScore);

  window.HealthAI.addPrediction({
    disease: 'Stroke',
    riskScore,
    riskLevel: risk.level,
    factors,
    inputs: vals
  });

  const resultContainer = document.getElementById('stroke-results');
  resultContainer.innerHTML = `
    <div class="prediction-result ${risk.class} animate-slide-in">
      <div class="result-icon ${risk.class}">
        <i data-lucide="${risk.class === 'low' ? 'shield-check' : risk.class === 'medium' ? 'alert-triangle' : 'alert-octagon'}"></i>
      </div>
      <div class="result-title">${risk.level} Risk of Stroke</div>
      <div class="result-confidence ${risk.class}">${riskScore.toFixed(1)}%</div>
      <p class="result-description">
        ${risk.class === 'low' ?
          'Low cerebrovascular risk profile. Continue healthy habits including regular exercise and stress management.' :
          risk.class === 'medium' ?
          'Moderate stroke risk identified. Focus on blood pressure management, glucose control, and consider neurology consultation.' :
          'High stroke risk detected. Immediate medical evaluation recommended including carotid imaging and comprehensive neurological assessment.'}
      </p>
      <div class="mt-lg btn-group justify-center">
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('recommendations')">
          <i data-lucide="lightbulb"></i> View Recommendations
        </button>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('report')">
          <i data-lucide="file-text"></i> Generate Report
        </button>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('stroke-charts-row').style.display = '';
  renderStrokeFactorsChart(factors);
  renderStrokeModifiableChart(modifiable, nonModifiable);
}

function renderStrokeFactorsChart(factors) {
  const ctx = document.getElementById('chart-stroke-factors');
  if (!ctx) return;
  window.HealthAI.destroyChart('strokeFactors');

  const sorted = Object.entries(factors).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(e => e[0]);
  const data = sorted.map(e => e[1]);
  const colors = data.map(v => {
    if (v >= 12) return chartColors.rose;
    if (v >= 5) return chartColors.amber;
    return chartColors.emerald;
  });

  window.HealthAI.charts['strokeFactors'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Impact',
        data,
        backgroundColor: colors.map(c => c.replace(')', ', 0.6)').replace('hsl', 'hsla')),
        borderColor: colors,
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Impact Score' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderStrokeModifiableChart(modifiable, nonModifiable) {
  const ctx = document.getElementById('chart-stroke-modifiable');
  if (!ctx) return;
  window.HealthAI.destroyChart('strokeModifiable');

  const modTotal = Object.values(modifiable).reduce((a, b) => a + b, 0);
  const nonModTotal = Object.values(nonModifiable).reduce((a, b) => a + b, 0);

  window.HealthAI.charts['strokeModifiable'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Modifiable Risk', 'Non-Modifiable Risk'],
      datasets: [{
        data: [modTotal, nonModTotal],
        backgroundColor: [chartColors.cyanAlpha.replace('0.15', '0.6'), chartColors.purpleAlpha.replace('0.15', '0.6')],
        borderColor: [chartColors.cyan, chartColors.purple],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const items = ctx.dataIndex === 0 ? modifiable : nonModifiable;
              return Object.entries(items).map(([k, v]) => `  ${k}: ${v}`).join('\n');
            }
          }
        }
      }
    }
  });
}
