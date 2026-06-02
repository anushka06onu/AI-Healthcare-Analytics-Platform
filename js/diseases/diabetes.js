/* ============================================================
   Diabetes Prediction Module
   ============================================================ */

function initDiabetes() {
  const container = document.getElementById('diabetes-content');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-2">
      <!-- Input Form -->
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Patient Parameters</div>
            <div class="glass-card-subtitle">Enter clinical values for diabetes risk assessment</div>
          </div>
        </div>
        <form id="diabetes-form" class="form-grid" autocomplete="off">
          <div class="form-group">
            <label class="form-label" for="db-pregnancies">Pregnancies</label>
            <input type="number" class="form-input" id="db-pregnancies" min="0" max="20" value="1" placeholder="0-20">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-glucose">Glucose <span class="unit">(mg/dL)</span></label>
            <input type="number" class="form-input" id="db-glucose" min="0" max="300" value="120" placeholder="70-200">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-bp">Blood Pressure <span class="unit">(mm Hg)</span></label>
            <input type="number" class="form-input" id="db-bp" min="0" max="200" value="80" placeholder="60-120">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-skin">Skin Thickness <span class="unit">(mm)</span></label>
            <input type="number" class="form-input" id="db-skin" min="0" max="100" value="20" placeholder="0-100">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-insulin">Insulin <span class="unit">(mu U/ml)</span></label>
            <input type="number" class="form-input" id="db-insulin" min="0" max="900" value="80" placeholder="0-900">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-bmi">BMI <span class="unit">(kg/m²)</span></label>
            <input type="number" class="form-input" id="db-bmi" min="10" max="70" step="0.1" value="25.0" placeholder="18-45">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-dpf">Diabetes Pedigree Function</label>
            <input type="number" class="form-input" id="db-dpf" min="0" max="2.5" step="0.01" value="0.35" placeholder="0.00-2.50">
          </div>
          <div class="form-group">
            <label class="form-label" for="db-age">Age <span class="unit">(years)</span></label>
            <input type="number" class="form-input" id="db-age" min="18" max="120" value="35" placeholder="18-120">
          </div>
        </form>
        <div class="mt-xl btn-group">
          <button class="btn btn-primary btn-lg" id="diabetes-predict-btn">
            <i data-lucide="scan"></i> Predict Risk
          </button>
          <button class="btn btn-secondary" id="diabetes-reset-btn">
            <i data-lucide="rotate-ccw"></i> Reset
          </button>
        </div>
      </div>

      <!-- Results Panel -->
      <div id="diabetes-results">
        <div class="glass-card">
          <div class="empty-state">
            <i data-lucide="droplets"></i>
            <p>Enter patient parameters and click <strong>Predict Risk</strong> to see results.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Factors Chart -->
    <div class="glass-card mt-xl" id="diabetes-chart-card" style="display:none;">
      <div class="glass-card-header">
        <div>
          <div class="glass-card-title">Risk Factor Contribution</div>
          <div class="glass-card-subtitle">Impact of each parameter on the prediction</div>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="chart-diabetes-factors"></canvas>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('diabetes-predict-btn').addEventListener('click', predictDiabetes);
  document.getElementById('diabetes-reset-btn').addEventListener('click', () => {
    document.getElementById('diabetes-form').reset();
    document.getElementById('diabetes-results').innerHTML = `
      <div class="glass-card"><div class="empty-state">
        <i data-lucide="droplets"></i>
        <p>Enter patient parameters and click <strong>Predict Risk</strong> to see results.</p>
      </div></div>`;
    document.getElementById('diabetes-chart-card').style.display = 'none';
    window.HealthAI.destroyChart('diabetesFactors');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

function predictDiabetes() {
  const vals = {
    pregnancies: +document.getElementById('db-pregnancies').value,
    glucose: +document.getElementById('db-glucose').value,
    bp: +document.getElementById('db-bp').value,
    skin: +document.getElementById('db-skin').value,
    insulin: +document.getElementById('db-insulin').value,
    bmi: +document.getElementById('db-bmi').value,
    dpf: +document.getElementById('db-dpf').value,
    age: +document.getElementById('db-age').value
  };

  // Weighted scoring based on clinical thresholds
  let score = 0;
  const factors = {};

  // Glucose (most important - 25%)
  if (vals.glucose > 140) { score += 25; factors.Glucose = 25; }
  else if (vals.glucose > 125) { score += 18; factors.Glucose = 18; }
  else if (vals.glucose > 100) { score += 10; factors.Glucose = 10; }
  else { factors.Glucose = 3; score += 3; }

  // BMI (20%)
  if (vals.bmi > 35) { score += 20; factors.BMI = 20; }
  else if (vals.bmi > 30) { score += 14; factors.BMI = 14; }
  else if (vals.bmi > 25) { score += 8; factors.BMI = 8; }
  else { factors.BMI = 2; score += 2; }

  // Age (15%)
  if (vals.age > 60) { score += 15; factors.Age = 15; }
  else if (vals.age > 45) { score += 10; factors.Age = 10; }
  else if (vals.age > 35) { score += 6; factors.Age = 6; }
  else { factors.Age = 2; score += 2; }

  // Blood Pressure (10%)
  if (vals.bp > 140) { score += 10; factors['Blood Pressure'] = 10; }
  else if (vals.bp > 120) { score += 6; factors['Blood Pressure'] = 6; }
  else { factors['Blood Pressure'] = 2; score += 2; }

  // Insulin (10%)
  if (vals.insulin > 200) { score += 10; factors.Insulin = 10; }
  else if (vals.insulin > 130) { score += 6; factors.Insulin = 6; }
  else { factors.Insulin = 2; score += 2; }

  // DPF (8%)
  if (vals.dpf > 1.0) { score += 8; factors['Pedigree Function'] = 8; }
  else if (vals.dpf > 0.5) { score += 5; factors['Pedigree Function'] = 5; }
  else { factors['Pedigree Function'] = 1; score += 1; }

  // Pregnancies (7%)
  if (vals.pregnancies > 6) { score += 7; factors.Pregnancies = 7; }
  else if (vals.pregnancies > 3) { score += 4; factors.Pregnancies = 4; }
  else { factors.Pregnancies = 1; score += 1; }

  // Skin Thickness (5%)
  if (vals.skin > 40) { score += 5; factors['Skin Thickness'] = 5; }
  else if (vals.skin > 25) { score += 3; factors['Skin Thickness'] = 3; }
  else { factors['Skin Thickness'] = 1; score += 1; }

  const riskScore = Math.min(score, 100);
  const risk = getRiskLevel(riskScore);

  // Save prediction
  window.HealthAI.addPrediction({
    disease: 'Diabetes',
    riskScore,
    riskLevel: risk.level,
    factors,
    inputs: vals
  });

  // Render result
  const resultContainer = document.getElementById('diabetes-results');
  resultContainer.innerHTML = `
    <div class="prediction-result ${risk.class} animate-slide-in">
      <div class="result-icon ${risk.class}">
        <i data-lucide="${risk.class === 'low' ? 'shield-check' : risk.class === 'medium' ? 'alert-triangle' : 'alert-octagon'}"></i>
      </div>
      <div class="result-title">${risk.level} Risk of Diabetes</div>
      <div class="result-confidence ${risk.class}">${riskScore.toFixed(1)}%</div>
      <p class="result-description">
        ${risk.class === 'low' ?
          'The analysis indicates a low probability of diabetes. Continue maintaining a healthy lifestyle with regular check-ups.' :
          risk.class === 'medium' ?
          'Moderate risk detected. Consider lifestyle modifications and consult your healthcare provider for further evaluation.' :
          'High risk indicators detected. Immediate medical consultation is strongly recommended for comprehensive testing.'}
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

  // Show and render chart
  document.getElementById('diabetes-chart-card').style.display = 'block';
  renderDiabetesFactorsChart(factors);
}

function renderDiabetesFactorsChart(factors) {
  const ctx = document.getElementById('chart-diabetes-factors');
  if (!ctx) return;
  window.HealthAI.destroyChart('diabetesFactors');

  const labels = Object.keys(factors);
  const data = Object.values(factors);
  const colors = data.map(v => {
    if (v >= 15) return chartColors.rose;
    if (v >= 8) return chartColors.amber;
    return chartColors.emerald;
  });

  window.HealthAI.charts['diabetesFactors'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Impact Score',
        data,
        backgroundColor: colors.map(c => c.replace(')', ', 0.6)').replace('hsl', 'hsla')),
        borderColor: colors,
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Impact Score' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}
