/* ============================================================
   Liver Disease Prediction Module
   ============================================================ */

function initLiver() {
  const container = document.getElementById('liver-content');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-2">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Liver Function Parameters</div>
            <div class="glass-card-subtitle">Enter liver panel values for disease risk assessment</div>
          </div>
        </div>
        <form id="liver-form" class="form-grid" autocomplete="off">
          <div class="form-group">
            <label class="form-label" for="lv-age">Age <span class="unit">(years)</span></label>
            <input type="number" class="form-input" id="lv-age" min="18" max="120" value="45">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-gender">Gender</label>
            <select class="form-select" id="lv-gender">
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-tb">Total Bilirubin <span class="unit">(mg/dL)</span></label>
            <input type="number" class="form-input" id="lv-tb" min="0" max="80" step="0.1" value="1.0">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-db">Direct Bilirubin <span class="unit">(mg/dL)</span></label>
            <input type="number" class="form-input" id="lv-db" min="0" max="20" step="0.1" value="0.3">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-alp">Alkaline Phosphatase <span class="unit">(IU/L)</span></label>
            <input type="number" class="form-input" id="lv-alp" min="40" max="2000" value="200">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-alt">Alamine Aminotransferase <span class="unit">(IU/L)</span></label>
            <input type="number" class="form-input" id="lv-alt" min="5" max="2000" value="25">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-ast">Aspartate Aminotransferase <span class="unit">(IU/L)</span></label>
            <input type="number" class="form-input" id="lv-ast" min="5" max="5000" value="30">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-tp">Total Proteins <span class="unit">(g/dL)</span></label>
            <input type="number" class="form-input" id="lv-tp" min="2" max="10" step="0.1" value="6.8">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-alb">Albumin <span class="unit">(g/dL)</span></label>
            <input type="number" class="form-input" id="lv-alb" min="1" max="6" step="0.1" value="3.5">
          </div>
          <div class="form-group">
            <label class="form-label" for="lv-ag">A/G Ratio</label>
            <input type="number" class="form-input" id="lv-ag" min="0.1" max="3" step="0.01" value="1.1">
          </div>
        </form>
        <div class="mt-xl btn-group">
          <button class="btn btn-primary btn-lg" id="liver-predict-btn">
            <i data-lucide="scan"></i> Predict Risk
          </button>
          <button class="btn btn-secondary" id="liver-reset-btn">
            <i data-lucide="rotate-ccw"></i> Reset
          </button>
        </div>
      </div>

      <div id="liver-results">
        <div class="glass-card">
          <div class="empty-state">
            <i data-lucide="bean"></i>
            <p>Enter liver panel values and click <strong>Predict Risk</strong>.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card mt-xl" id="liver-chart-card" style="display:none;">
      <div class="glass-card-header">
        <div>
          <div class="glass-card-title">Liver Function Panel</div>
          <div class="glass-card-subtitle">Patient values compared to normal ranges</div>
        </div>
      </div>
      <div class="chart-container tall">
        <canvas id="chart-liver-panel"></canvas>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('liver-predict-btn').addEventListener('click', predictLiver);
  document.getElementById('liver-reset-btn').addEventListener('click', () => {
    document.getElementById('liver-form').reset();
    document.getElementById('liver-results').innerHTML = `
      <div class="glass-card"><div class="empty-state">
        <i data-lucide="bean"></i>
        <p>Enter liver panel values and click <strong>Predict Risk</strong>.</p>
      </div></div>`;
    document.getElementById('liver-chart-card').style.display = 'none';
    window.HealthAI.destroyChart('liverPanel');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });
}

function predictLiver() {
  const vals = {
    age: +document.getElementById('lv-age').value,
    gender: +document.getElementById('lv-gender').value,
    tb: +document.getElementById('lv-tb').value,
    db: +document.getElementById('lv-db').value,
    alp: +document.getElementById('lv-alp').value,
    alt: +document.getElementById('lv-alt').value,
    ast: +document.getElementById('lv-ast').value,
    tp: +document.getElementById('lv-tp').value,
    alb: +document.getElementById('lv-alb').value,
    ag: +document.getElementById('lv-ag').value
  };

  let score = 0;
  const factors = {};

  // Total Bilirubin (20%)
  if (vals.tb > 3.0) { score += 20; factors['Total Bilirubin'] = 20; }
  else if (vals.tb > 1.2) { score += 12; factors['Total Bilirubin'] = 12; }
  else { factors['Total Bilirubin'] = 2; score += 2; }

  // Direct Bilirubin (10%)
  if (vals.db > 1.0) { score += 10; factors['Direct Bilirubin'] = 10; }
  else if (vals.db > 0.4) { score += 5; factors['Direct Bilirubin'] = 5; }
  else { factors['Direct Bilirubin'] = 1; score += 1; }

  // ALP (15%)
  if (vals.alp > 500) { score += 15; factors.ALP = 15; }
  else if (vals.alp > 300) { score += 10; factors.ALP = 10; }
  else if (vals.alp > 150) { score += 5; factors.ALP = 5; }
  else { factors.ALP = 1; score += 1; }

  // ALT (15%)
  if (vals.alt > 100) { score += 15; factors.ALT = 15; }
  else if (vals.alt > 55) { score += 10; factors.ALT = 10; }
  else if (vals.alt > 40) { score += 5; factors.ALT = 5; }
  else { factors.ALT = 1; score += 1; }

  // AST (15%)
  if (vals.ast > 120) { score += 15; factors.AST = 15; }
  else if (vals.ast > 60) { score += 10; factors.AST = 10; }
  else if (vals.ast > 40) { score += 5; factors.AST = 5; }
  else { factors.AST = 1; score += 1; }

  // Total Proteins (8%)
  if (vals.tp < 5.5) { score += 8; factors['Total Proteins'] = 8; }
  else if (vals.tp < 6.0 || vals.tp > 8.5) { score += 4; factors['Total Proteins'] = 4; }
  else { factors['Total Proteins'] = 1; score += 1; }

  // Albumin (10%)
  if (vals.alb < 2.5) { score += 10; factors.Albumin = 10; }
  else if (vals.alb < 3.5) { score += 6; factors.Albumin = 6; }
  else { factors.Albumin = 1; score += 1; }

  // A/G Ratio (7%)
  if (vals.ag < 0.8) { score += 7; factors['A/G Ratio'] = 7; }
  else if (vals.ag < 1.0) { score += 4; factors['A/G Ratio'] = 4; }
  else { factors['A/G Ratio'] = 1; score += 1; }

  const riskScore = Math.min(score, 100);
  const risk = getRiskLevel(riskScore);

  window.HealthAI.addPrediction({
    disease: 'Liver Disease',
    riskScore,
    riskLevel: risk.level,
    factors,
    inputs: vals
  });

  const resultContainer = document.getElementById('liver-results');
  resultContainer.innerHTML = `
    <div class="prediction-result ${risk.class} animate-slide-in">
      <div class="result-icon ${risk.class}">
        <i data-lucide="${risk.class === 'low' ? 'shield-check' : risk.class === 'medium' ? 'alert-triangle' : 'alert-octagon'}"></i>
      </div>
      <div class="result-title">${risk.level} Risk of Liver Disease</div>
      <div class="result-confidence ${risk.class}">${riskScore.toFixed(1)}%</div>
      <p class="result-description">
        ${risk.class === 'low' ?
          'Liver function markers are within normal ranges. Maintain a balanced diet and limit alcohol intake.' :
          risk.class === 'medium' ?
          'Some liver markers are elevated. Further hepatic evaluation including ultrasound is recommended.' :
          'Significantly abnormal liver function detected. Immediate hepatology consultation and imaging studies are strongly advised.'}
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

  document.getElementById('liver-chart-card').style.display = 'block';
  renderLiverPanel(vals);
}

function renderLiverPanel(vals) {
  const ctx = document.getElementById('chart-liver-panel');
  if (!ctx) return;
  window.HealthAI.destroyChart('liverPanel');

  // Normal ranges (upper limits)
  const labels = ['Bilirubin', 'Dir. Bilirubin', 'ALP', 'ALT', 'AST', 'Proteins', 'Albumin'];
  const normalMax = [1.2, 0.4, 150, 40, 40, 8.3, 5.0];
  const patientVals = [vals.tb, vals.db, vals.alp / 10, vals.alt, vals.ast, vals.tp, vals.alb];
  const normalVals = [1.2, 0.4, 15, 40, 40, 8.3, 5.0];

  window.HealthAI.charts['liverPanel'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Patient Value',
          data: patientVals,
          backgroundColor: chartColors.amberAlpha.replace('0.15', '0.5'),
          borderColor: chartColors.amber,
          borderWidth: 1.5
        },
        {
          label: 'Normal Max',
          data: normalVals,
          backgroundColor: chartColors.emeraldAlpha.replace('0.15', '0.3'),
          borderColor: chartColors.emerald,
          borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Value (scaled)' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
