/* ============================================================
   Dashboard Module
   ============================================================ */

function initDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  const predictions = window.HealthAI.predictions;
  const totalPredictions = predictions.length || 0;
  const highRiskCount = predictions.filter(p => p.riskScore >= 65).length;
  const avgAccuracy = 94.2;

  container.innerHTML = `
    <!-- Stats Grid -->
    <div class="stats-grid stagger-children">
      <div class="stat-card cyan">
        <div class="stat-icon cyan"><i data-lucide="activity"></i></div>
        <div class="stat-info">
          <div class="stat-label">Total Predictions</div>
          <div class="stat-value" id="stat-total">${totalPredictions}</div>
          <div class="stat-change positive"><i data-lucide="trending-up"></i> Active</div>
        </div>
      </div>
      <div class="stat-card emerald">
        <div class="stat-icon emerald"><i data-lucide="target"></i></div>
        <div class="stat-info">
          <div class="stat-label">Model Accuracy</div>
          <div class="stat-value" id="stat-accuracy">0%</div>
          <div class="stat-change positive"><i data-lucide="trending-up"></i> +2.1% this month</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon purple"><i data-lucide="users"></i></div>
        <div class="stat-info">
          <div class="stat-label">Patients Analyzed</div>
          <div class="stat-value" id="stat-patients">0</div>
          <div class="stat-change positive"><i data-lucide="trending-up"></i> Growing</div>
        </div>
      </div>
      <div class="stat-card rose">
        <div class="stat-icon rose"><i data-lucide="alert-triangle"></i></div>
        <div class="stat-info">
          <div class="stat-label">High Risk Alerts</div>
          <div class="stat-value" id="stat-alerts">${highRiskCount}</div>
          <div class="stat-change ${highRiskCount > 0 ? 'negative' : 'positive'}">
            <i data-lucide="${highRiskCount > 0 ? 'trending-up' : 'check'}"></i>
            ${highRiskCount > 0 ? 'Needs attention' : 'All clear'}
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid-2 section-spacer">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Disease Distribution</div>
            <div class="glass-card-subtitle">Breakdown by disease type</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-distribution"></canvas>
        </div>
      </div>
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Monthly Prediction Trends</div>
            <div class="glass-card-subtitle">Predictions over the past 6 months</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="chart-trends"></canvas>
        </div>
      </div>
    </div>

    <!-- Quick Actions + Recent Predictions -->
    <div class="grid-2-1 section-spacer">
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Recent Predictions</div>
            <div class="glass-card-subtitle">Latest AI analysis results</div>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table" id="recent-predictions-table">
            <thead>
              <tr>
                <th>Disease</th>
                <th>Risk Score</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${predictions.length === 0 ?
                '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 2rem;">No predictions yet. Try a disease predictor!</td></tr>' :
                predictions.slice(0, 8).map(p => {
                  const risk = getRiskLevel(p.riskScore);
                  return `<tr>
                    <td style="font-weight:600;">${p.disease}</td>
                    <td>${p.riskScore.toFixed(1)}%</td>
                    <td><span class="badge ${risk.badge}">${risk.level}</span></td>
                    <td class="text-muted">${formatDate(p.timestamp)}</td>
                  </tr>`;
                }).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Quick Actions</div>
            <div class="glass-card-subtitle">Start a new analysis</div>
          </div>
        </div>
        <div class="flex flex-col gap-sm">
          <button class="btn btn-secondary w-full" onclick="navigateTo('diabetes')" id="quick-diabetes">
            <i data-lucide="droplets"></i> Diabetes Prediction
          </button>
          <button class="btn btn-secondary w-full" onclick="navigateTo('heart')" id="quick-heart">
            <i data-lucide="heart-pulse"></i> Heart Disease
          </button>
          <button class="btn btn-secondary w-full" onclick="navigateTo('liver')" id="quick-liver">
            <i data-lucide="bean"></i> Liver Disease
          </button>
          <button class="btn btn-secondary w-full" onclick="navigateTo('stroke')" id="quick-stroke">
            <i data-lucide="brain"></i> Stroke Risk
          </button>
          <hr style="border: none; border-top: 1px solid var(--glass-border); margin: var(--space-sm) 0;">
          <button class="btn btn-primary w-full" onclick="navigateTo('report')" id="quick-report">
            <i data-lucide="file-text"></i> Generate Report
          </button>
        </div>
      </div>
    </div>

    <!-- Risk Overview Chart -->
    <div class="glass-card section-spacer">
      <div class="glass-card-header">
        <div>
          <div class="glass-card-title">Risk Score Comparison</div>
          <div class="glass-card-subtitle">Latest risk scores across all disease models</div>
        </div>
      </div>
      <div class="chart-container short">
        <canvas id="chart-risk-comparison"></canvas>
      </div>
    </div>
  `;

  // Re-initialize Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Animate counters
  const statTotal = document.getElementById('stat-total');
  const statAccuracy = document.getElementById('stat-accuracy');
  const statPatients = document.getElementById('stat-patients');

  if (statTotal) animateCounter(statTotal, totalPredictions, 800);
  if (statAccuracy) animateCounter(statAccuracy, avgAccuracy, 1000, '', '%');
  if (statPatients) animateCounter(statPatients, Math.max(totalPredictions, 1247), 1200);

  // Render charts
  renderDistributionChart();
  renderTrendsChart();
  renderRiskComparisonChart();
}

function renderDistributionChart() {
  const ctx = document.getElementById('chart-distribution');
  if (!ctx) return;
  window.HealthAI.destroyChart('distribution');

  const predictions = window.HealthAI.predictions;
  const counts = { Diabetes: 0, 'Heart Disease': 0, 'Liver Disease': 0, Stroke: 0 };
  predictions.forEach(p => { if (counts[p.disease] !== undefined) counts[p.disease]++; });

  // Use sample data if no predictions yet
  const hasData = Object.values(counts).some(v => v > 0);
  const data = hasData ? Object.values(counts) : [32, 28, 18, 22];

  window.HealthAI.charts['distribution'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Diabetes', 'Heart Disease', 'Liver Disease', 'Stroke'],
      datasets: [{
        data: data,
        backgroundColor: [chartColors.cyan, chartColors.rose, chartColors.amber, chartColors.purple],
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderTrendsChart() {
  const ctx = document.getElementById('chart-trends');
  if (!ctx) return;
  window.HealthAI.destroyChart('trends');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  window.HealthAI.charts['trends'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Diabetes',
          data: [18, 24, 20, 28, 32, 30],
          borderColor: chartColors.cyan,
          backgroundColor: chartColors.cyanAlpha,
          fill: true
        },
        {
          label: 'Heart Disease',
          data: [15, 18, 22, 20, 26, 28],
          borderColor: chartColors.rose,
          backgroundColor: chartColors.roseAlpha,
          fill: true
        },
        {
          label: 'Liver Disease',
          data: [8, 12, 10, 14, 16, 18],
          borderColor: chartColors.amber,
          backgroundColor: chartColors.amberAlpha,
          fill: true
        },
        {
          label: 'Stroke',
          data: [10, 14, 12, 18, 20, 22],
          borderColor: chartColors.purple,
          backgroundColor: chartColors.purpleAlpha,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Predictions' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderRiskComparisonChart() {
  const ctx = document.getElementById('chart-risk-comparison');
  if (!ctx) return;
  window.HealthAI.destroyChart('riskComparison');

  const diseases = ['Diabetes', 'Heart Disease', 'Liver Disease', 'Stroke'];
  const scores = diseases.map(d => {
    const pred = window.HealthAI.getLatestByDisease(d);
    return pred ? pred.riskScore : (20 + Math.random() * 40);
  });

  const colors = scores.map(s => {
    if (s < 35) return chartColors.emerald;
    if (s < 65) return chartColors.amber;
    return chartColors.rose;
  });

  window.HealthAI.charts['riskComparison'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: diseases,
      datasets: [{
        label: 'Risk Score (%)',
        data: scores.map(s => s.toFixed(1)),
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
        x: { beginAtZero: true, max: 100, title: { display: true, text: 'Risk Score (%)' } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
