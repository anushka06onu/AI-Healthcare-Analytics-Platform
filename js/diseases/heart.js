/* ============================================================
   Heart Disease Prediction Module
   ============================================================ */

function initHeart() {
  const container = document.getElementById('heart-content');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-2">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Cardiovascular Parameters</div>
            <div class="glass-card-subtitle">Enter clinical values for heart disease risk assessment</div>
          </div>
        </div>
        <form id="heart-form" class="form-grid" autocomplete="off">
          <div class="form-group">
            <label class="form-label" for="ht-age">Age <span class="unit">(years)</span></label>
            <input type="number" class="form-input" id="ht-age" min="18" max="120" value="50">
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-sex">Sex</label>
            <select class="form-select" id="ht-sex">
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-cp">Chest Pain Type</label>
            <select class="form-select" id="ht-cp">
              <option value="0">Typical Angina</option>
              <option value="1">Atypical Angina</option>
              <option value="2">Non-anginal Pain</option>
              <option value="3">Asymptomatic</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-rbp">Resting BP <span class="unit">(mm Hg)</span></label>
            <input type="number" class="form-input" id="ht-rbp" min="80" max="220" value="130">
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-chol">Cholesterol <span class="unit">(mg/dL)</span></label>
            <input type="number" class="form-input" id="ht-chol" min="100" max="600" value="240">
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-fbs">Fasting Blood Sugar &gt;120</label>
            <select class="form-select" id="ht-fbs">
              <option value="0">No (&le;120 mg/dL)</option>
              <option value="1">Yes (&gt;120 mg/dL)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-ecg">Resting ECG</label>
            <select class="form-select" id="ht-ecg">
              <option value="0">Normal</option>
              <option value="1">ST-T Abnormality</option>
              <option value="2">LV Hypertrophy</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-maxhr">Max Heart Rate</label>
            <input type="number" class="form-input" id="ht-maxhr" min="60" max="220" value="150">
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-exang">Exercise Angina</label>
            <select class="form-select" id="ht-exang">
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-oldpeak">ST Depression</label>
            <input type="number" class="form-input" id="ht-oldpeak" min="0" max="7" step="0.1" value="1.0">
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-slope">ST Slope</label>
            <select class="form-select" id="ht-slope">
              <option value="0">Upsloping</option>
              <option value="1">Flat</option>
              <option value="2">Downsloping</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ht-ca">Major Vessels (CA)</label>
            <select class="form-select" id="ht-ca">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </form>
        <div class="mt-xl btn-group">
          <button class="btn btn-primary btn-lg" id="heart-predict-btn">
            <i data-lucide="scan"></i> Predict Risk
          </button>
          <button class="btn btn-secondary" id="heart-reset-btn">
            <i data-lucide="rotate-ccw"></i> Reset
          </button>
        </div>
      </div>

      <div id="heart-results">
        <div class="glass-card">
          <div class="empty-state">
            <i data-lucide="heart-pulse"></i>
            <p>Enter cardiovascular parameters and click <strong>Predict Risk</strong>.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Radar Chart -->
    <div class="glass-card mt-xl" id="heart-chart-card" style="display:none;">
      <div class="glass-card-header">
        <div>
          <div class="glass-card-title">Heart Health Radar</div>
          <div class="glass-card-subtitle">Multi-dimensional cardiovascular assessment</div>
        </div>
      </div>
      <div class="chart-container tall">
        <canvas id="chart-heart-radar"></canvas>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('heart-predict-btn').addEventListener('click', predictHeart);
  document.getElementById('heart-reset-btn').addEventListener('click', () => {
    document.getElementById('heart-form').reset();
    document.getElementById('heart-results').innerHTML = `
      <div class="glass-card"><div class="empty-state">
        <i data-lucide="heart-pulse"></i>
        <p>Enter cardiovascular parameters and click <strong>Predict Risk</strong>.</p>
      </div></div>`;
    document.getElementById('heart-chart-card').style.display = 'none';
    window.HealthAI.destroyChart('heartRadar');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

function predictHeart() {
  const vals = {
    age: +document.getElementById('ht-age').value,
    sex: +document.getElementById('ht-sex').value,
    cp: +document.getElementById('ht-cp').value,
    rbp: +document.getElementById('ht-rbp').value,
    chol: +document.getElementById('ht-chol').value,
    fbs: +document.getElementById('ht-fbs').value,
    ecg: +document.getElementById('ht-ecg').value,
    maxhr: +document.getElementById('ht-maxhr').value,
    exang: +document.getElementById('ht-exang').value,
    oldpeak: +document.getElementById('ht-oldpeak').value,
    slope: +document.getElementById('ht-slope').value,
    ca: +document.getElementById('ht-ca').value
  };

  let score = 0;
  const factors = {};

  // Age (15%)
  if (vals.age > 65) { score += 15; factors.Age = 15; }
  else if (vals.age > 55) { score += 10; factors.Age = 10; }
  else if (vals.age > 45) { score += 6; factors.Age = 6; }
  else { factors.Age = 2; score += 2; }

  // Sex (5%) — male higher risk
  if (vals.sex === 1) { score += 5; factors.Sex = 5; }
  else { factors.Sex = 2; score += 2; }

  // Chest Pain (15%)
  if (vals.cp === 3) { score += 15; factors['Chest Pain'] = 15; }
  else if (vals.cp === 2) { score += 8; factors['Chest Pain'] = 8; }
  else if (vals.cp === 1) { score += 4; factors['Chest Pain'] = 4; }
  else { factors['Chest Pain'] = 1; score += 1; }

  // Resting BP (10%)
  if (vals.rbp > 160) { score += 10; factors['Resting BP'] = 10; }
  else if (vals.rbp > 140) { score += 7; factors['Resting BP'] = 7; }
  else if (vals.rbp > 120) { score += 4; factors['Resting BP'] = 4; }
  else { factors['Resting BP'] = 1; score += 1; }

  // Cholesterol (12%)
  if (vals.chol > 300) { score += 12; factors.Cholesterol = 12; }
  else if (vals.chol > 240) { score += 8; factors.Cholesterol = 8; }
  else if (vals.chol > 200) { score += 4; factors.Cholesterol = 4; }
  else { factors.Cholesterol = 1; score += 1; }

  // Fasting Blood Sugar (5%)
  if (vals.fbs === 1) { score += 5; factors['Fasting BS'] = 5; }
  else { factors['Fasting BS'] = 1; score += 1; }

  // ECG (8%)
  if (vals.ecg === 2) { score += 8; factors.ECG = 8; }
  else if (vals.ecg === 1) { score += 5; factors.ECG = 5; }
  else { factors.ECG = 1; score += 1; }

  // Max Heart Rate (10%) — lower is worse
  if (vals.maxhr < 120) { score += 10; factors['Max HR'] = 10; }
  else if (vals.maxhr < 140) { score += 6; factors['Max HR'] = 6; }
  else if (vals.maxhr < 160) { score += 3; factors['Max HR'] = 3; }
  else { factors['Max HR'] = 1; score += 1; }

  // Exercise Angina (8%)
  if (vals.exang === 1) { score += 8; factors['Exercise Angina'] = 8; }
  else { factors['Exercise Angina'] = 1; score += 1; }

  // ST Depression (7%)
  if (vals.oldpeak > 3) { score += 7; factors['ST Depression'] = 7; }
  else if (vals.oldpeak > 1.5) { score += 4; factors['ST Depression'] = 4; }
  else { factors['ST Depression'] = 1; score += 1; }

  // Major Vessels (5%)
  score += vals.ca * 1.67; factors['Major Vessels'] = Math.round(vals.ca * 1.67 * 10) / 10 || 0;

  const riskScore = Math.min(score, 100);
  const risk = getRiskLevel(riskScore);

  window.HealthAI.addPrediction({
    disease: 'Heart Disease',
    riskScore,
    riskLevel: risk.level,
    factors,
    inputs: vals
  });

  const resultContainer = document.getElementById('heart-results');
  resultContainer.innerHTML = `
    <div class="prediction-result ${risk.class} animate-slide-in">
      <div class="result-icon ${risk.class}">
        <i data-lucide="${risk.class === 'low' ? 'heart' : risk.class === 'medium' ? 'alert-triangle' : 'alert-octagon'}"></i>
      </div>
      <div class="result-title">${risk.level} Risk of Heart Disease</div>
      <div class="result-confidence ${risk.class}">${riskScore.toFixed(1)}%</div>
      <p class="result-description">
        ${risk.class === 'low' ?
          'Your cardiovascular profile looks healthy. Continue regular exercise and heart-healthy diet.' :
          risk.class === 'medium' ?
          'Some cardiovascular risk factors identified. Schedule a cardiac evaluation and consider lifestyle changes.' :
          'Significant cardiovascular risk detected. Urgent cardiology consultation recommended for stress testing and imaging.'}
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

  document.getElementById('heart-chart-card').style.display = 'block';
  renderHeartRadar(factors);
}

function renderHeartRadar(factors) {
  const ctx = document.getElementById('chart-heart-radar');
  if (!ctx) return;
  window.HealthAI.destroyChart('heartRadar');

  const labels = Object.keys(factors);
  const data = Object.values(factors);
  const maxVals = [15, 5, 15, 10, 12, 5, 8, 10, 8, 7, 5];
  const normalized = data.map((v, i) => ((v / (maxVals[i] || 15)) * 100).toFixed(1));

  window.HealthAI.charts['heartRadar'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Risk Profile',
        data: normalized,
        backgroundColor: chartColors.roseAlpha,
        borderColor: chartColors.rose,
        borderWidth: 2,
        pointBackgroundColor: chartColors.rose,
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'hsla(220, 50%, 60%, 0.08)' },
          angleLines: { color: 'hsla(220, 50%, 60%, 0.08)' },
          pointLabels: { font: { size: 11 } },
          ticks: { display: false }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}
