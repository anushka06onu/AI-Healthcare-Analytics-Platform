/* ============================================================
   Analytics Module — Disease Insights, Risk Factors, Trends
   ============================================================ */

function initAnalytics() {
  const container = document.getElementById('analytics-content');
  if (!container) return;

  container.innerHTML = `
    <!-- Tabs -->
    <div class="tabs">
      <div class="tab active" data-tab="insights">Disease Insights</div>
      <div class="tab" data-tab="riskfactors">Risk Factors</div>
      <div class="tab" data-tab="trends">Trends</div>
    </div>

    <!-- Disease Insights Tab -->
    <div class="tab-content active" id="tab-insights">
      <div class="stats-grid stagger-children mb-xl">
        <div class="stat-card cyan">
          <div class="stat-icon cyan"><i data-lucide="droplets"></i></div>
          <div class="stat-info">
            <div class="stat-label">Diabetes Prevalence</div>
            <div class="stat-value">10.5%</div>
            <div class="stat-change negative"><i data-lucide="trending-up"></i> +1.2% vs last year</div>
          </div>
        </div>
        <div class="stat-card rose">
          <div class="stat-icon rose"><i data-lucide="heart-pulse"></i></div>
          <div class="stat-info">
            <div class="stat-label">Heart Disease</div>
            <div class="stat-value">6.7%</div>
            <div class="stat-change positive"><i data-lucide="trending-down"></i> -0.3% vs last year</div>
          </div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon amber"><i data-lucide="bean"></i></div>
          <div class="stat-info">
            <div class="stat-label">Liver Disease</div>
            <div class="stat-value">4.5%</div>
            <div class="stat-change negative"><i data-lucide="trending-up"></i> +0.8% vs last year</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon purple"><i data-lucide="brain"></i></div>
          <div class="stat-info">
            <div class="stat-label">Stroke Incidence</div>
            <div class="stat-value">3.1%</div>
            <div class="stat-change positive"><i data-lucide="trending-down"></i> -0.5% vs last year</div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-xl">
        <div class="glass-card">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Age Distribution by Disease</div>
              <div class="glass-card-subtitle">Patient age groups across diseases</div>
            </div>
          </div>
          <div class="chart-container tall">
            <canvas id="chart-age-distribution"></canvas>
          </div>
        </div>
        <div class="glass-card">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Gender Distribution</div>
              <div class="glass-card-subtitle">Disease prevalence by gender</div>
            </div>
          </div>
          <div class="chart-container tall">
            <canvas id="chart-gender-distribution"></canvas>
          </div>
        </div>
      </div>

      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Comorbidity Matrix</div>
            <div class="glass-card-subtitle">Likelihood of co-occurring conditions (%)</div>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Diabetes</th>
                <th>Heart Disease</th>
                <th>Liver Disease</th>
                <th>Stroke</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-semibold">Diabetes</td>
                <td>—</td>
                <td><span class="badge badge-warning">34%</span></td>
                <td><span class="badge badge-info">18%</span></td>
                <td><span class="badge badge-warning">28%</span></td>
              </tr>
              <tr>
                <td class="font-semibold">Heart Disease</td>
                <td><span class="badge badge-warning">34%</span></td>
                <td>—</td>
                <td><span class="badge badge-info">12%</span></td>
                <td><span class="badge badge-danger">42%</span></td>
              </tr>
              <tr>
                <td class="font-semibold">Liver Disease</td>
                <td><span class="badge badge-info">18%</span></td>
                <td><span class="badge badge-info">12%</span></td>
                <td>—</td>
                <td><span class="badge badge-info">8%</span></td>
              </tr>
              <tr>
                <td class="font-semibold">Stroke</td>
                <td><span class="badge badge-warning">28%</span></td>
                <td><span class="badge badge-danger">42%</span></td>
                <td><span class="badge badge-info">8%</span></td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Risk Factors Tab -->
    <div class="tab-content" id="tab-riskfactors">
      <div class="grid-2 mb-xl">
        <div class="glass-card">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Top Risk Factors by Disease</div>
              <div class="glass-card-subtitle">Most significant predictors</div>
            </div>
          </div>
          <div class="chart-container tall">
            <canvas id="chart-top-risk-factors"></canvas>
          </div>
        </div>
        <div class="glass-card">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Population Risk Distribution</div>
              <div class="glass-card-subtitle">Risk levels across analyzed population</div>
            </div>
          </div>
          <div class="chart-container tall">
            <canvas id="chart-population-risk"></canvas>
          </div>
        </div>
      </div>

      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Cross-Disease Risk Factor Analysis</div>
            <div class="glass-card-subtitle">Common risk factors shared across multiple diseases</div>
          </div>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Risk Factor</th>
                <th>Diabetes</th>
                <th>Heart Disease</th>
                <th>Liver Disease</th>
                <th>Stroke</th>
                <th>Diseases Affected</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="font-semibold">High BMI</td><td>★★★</td><td>★★★</td><td>★★</td><td>★★★</td><td><span class="badge badge-danger">4</span></td></tr>
              <tr><td class="font-semibold">Age &gt; 55</td><td>★★★</td><td>★★★</td><td>★★</td><td>★★★</td><td><span class="badge badge-danger">4</span></td></tr>
              <tr><td class="font-semibold">High Blood Pressure</td><td>★★</td><td>★★★</td><td>★</td><td>★★★</td><td><span class="badge badge-warning">3</span></td></tr>
              <tr><td class="font-semibold">High Glucose</td><td>★★★</td><td>★★</td><td>★</td><td>★★★</td><td><span class="badge badge-warning">3</span></td></tr>
              <tr><td class="font-semibold">Smoking</td><td>★</td><td>★★</td><td>★★</td><td>★★★</td><td><span class="badge badge-warning">3</span></td></tr>
              <tr><td class="font-semibold">High Cholesterol</td><td>★</td><td>★★★</td><td>★★</td><td>★★</td><td><span class="badge badge-warning">3</span></td></tr>
              <tr><td class="font-semibold">Alcohol Use</td><td>★</td><td>★</td><td>★★★</td><td>★</td><td><span class="badge badge-info">2</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Trends Tab -->
    <div class="tab-content" id="tab-trends">
      <div class="glass-card mb-xl">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Prediction Accuracy Over Time</div>
            <div class="glass-card-subtitle">Monthly model performance metrics</div>
          </div>
        </div>
        <div class="chart-container tall">
          <canvas id="chart-accuracy-trends"></canvas>
        </div>
      </div>
      <div class="grid-2">
        <div class="glass-card">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Seasonal Disease Patterns</div>
              <div class="glass-card-subtitle">Disease incidence by quarter</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="chart-seasonal"></canvas>
          </div>
        </div>
        <div class="glass-card">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Prediction Volume</div>
              <div class="glass-card-subtitle">Weekly prediction counts</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="chart-volume"></canvas>
          </div>
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
      renderAnalyticsCharts(tab.dataset.tab);
    });
  });

  renderAnalyticsCharts('insights');
}

function renderAnalyticsCharts(activeTab) {
  if (activeTab === 'insights') {
    renderAgeDistributionChart();
    renderGenderDistributionChart();
  } else if (activeTab === 'riskfactors') {
    renderTopRiskFactorsChart();
    renderPopulationRiskChart();
  } else if (activeTab === 'trends') {
    renderAccuracyTrendsChart();
    renderSeasonalChart();
    renderVolumeChart();
  }
}

function renderAgeDistributionChart() {
  const ctx = document.getElementById('chart-age-distribution');
  if (!ctx) return;
  window.HealthAI.destroyChart('ageDistribution');

  window.HealthAI.charts['ageDistribution'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['18-30', '31-40', '41-50', '51-60', '61-70', '70+'],
      datasets: [
        { label: 'Diabetes', data: [5, 12, 22, 30, 35, 28], backgroundColor: chartColors.cyanAlpha.replace('0.15','0.6'), borderColor: chartColors.cyan, borderWidth: 1 },
        { label: 'Heart Disease', data: [3, 8, 18, 28, 32, 30], backgroundColor: chartColors.roseAlpha.replace('0.15','0.6'), borderColor: chartColors.rose, borderWidth: 1 },
        { label: 'Liver Disease', data: [8, 15, 20, 18, 12, 8], backgroundColor: chartColors.amberAlpha.replace('0.15','0.6'), borderColor: chartColors.amber, borderWidth: 1 },
        { label: 'Stroke', data: [2, 5, 12, 22, 30, 35], backgroundColor: chartColors.purpleAlpha.replace('0.15','0.6'), borderColor: chartColors.purple, borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Age Group' } },
        y: { beginAtZero: true, title: { display: true, text: 'Cases per 1000' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderGenderDistributionChart() {
  const ctx = document.getElementById('chart-gender-distribution');
  if (!ctx) return;
  window.HealthAI.destroyChart('genderDistribution');

  window.HealthAI.charts['genderDistribution'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Diabetes', 'Heart Disease', 'Liver Disease', 'Stroke'],
      datasets: [
        { label: 'Male', data: [48, 62, 58, 52], backgroundColor: chartColors.blueAlpha.replace('0.15','0.6'), borderColor: chartColors.blue, borderWidth: 1 },
        { label: 'Female', data: [52, 38, 42, 48], backgroundColor: chartColors.purpleAlpha.replace('0.15','0.6'), borderColor: chartColors.purple, borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderTopRiskFactorsChart() {
  const ctx = document.getElementById('chart-top-risk-factors');
  if (!ctx) return;
  window.HealthAI.destroyChart('topRiskFactors');

  window.HealthAI.charts['topRiskFactors'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['BMI', 'Glucose', 'Blood Pressure', 'Cholesterol', 'Age', 'Smoking'],
      datasets: [
        { label: 'Diabetes', data: [85, 95, 60, 40, 70, 30], borderColor: chartColors.cyan, backgroundColor: chartColors.cyanAlpha, pointBackgroundColor: chartColors.cyan },
        { label: 'Heart Disease', data: [70, 50, 85, 90, 80, 65], borderColor: chartColors.rose, backgroundColor: chartColors.roseAlpha, pointBackgroundColor: chartColors.rose },
        { label: 'Stroke', data: [65, 75, 90, 60, 85, 80], borderColor: chartColors.purple, backgroundColor: chartColors.purpleAlpha, pointBackgroundColor: chartColors.purple }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true, max: 100,
          grid: { color: 'hsla(220, 50%, 60%, 0.08)' },
          angleLines: { color: 'hsla(220, 50%, 60%, 0.08)' },
          ticks: { display: false }
        }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderPopulationRiskChart() {
  const ctx = document.getElementById('chart-population-risk');
  if (!ctx) return;
  window.HealthAI.destroyChart('populationRisk');

  window.HealthAI.charts['populationRisk'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Diabetes', 'Heart Disease', 'Liver Disease', 'Stroke'],
      datasets: [
        { label: 'Low Risk', data: [45, 40, 55, 50], backgroundColor: 'hsla(160, 70%, 48%, 0.5)', borderColor: chartColors.emerald, borderWidth: 1 },
        { label: 'Medium Risk', data: [35, 32, 30, 28], backgroundColor: 'hsla(38, 92%, 55%, 0.5)', borderColor: chartColors.amber, borderWidth: 1 },
        { label: 'High Risk', data: [20, 28, 15, 22], backgroundColor: 'hsla(350, 80%, 60%, 0.5)', borderColor: chartColors.rose, borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, max: 100, title: { display: true, text: 'Population (%)' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderAccuracyTrendsChart() {
  const ctx = document.getElementById('chart-accuracy-trends');
  if (!ctx) return;
  window.HealthAI.destroyChart('accuracyTrends');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  window.HealthAI.charts['accuracyTrends'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Diabetes Model', data: [91, 91.5, 92, 92.3, 93, 93.2, 93.5, 93.8, 94, 94.1, 94.2, 94.5], borderColor: chartColors.cyan, backgroundColor: chartColors.cyanAlpha, fill: true },
        { label: 'Heart Model', data: [88, 88.5, 89, 89.8, 90, 90.5, 91, 91.3, 91.5, 92, 92.2, 92.5], borderColor: chartColors.rose, backgroundColor: chartColors.roseAlpha, fill: true },
        { label: 'Liver Model', data: [87, 87.5, 88, 88.5, 89, 89.5, 90, 90.2, 90.5, 91, 91.2, 91.5], borderColor: chartColors.amber, backgroundColor: chartColors.amberAlpha, fill: true },
        { label: 'Stroke Model', data: [86, 86.5, 87, 87.8, 88, 88.5, 89, 89.5, 90, 90.5, 91, 91.2], borderColor: chartColors.purple, backgroundColor: chartColors.purpleAlpha, fill: true }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { min: 84, max: 96, title: { display: true, text: 'Accuracy (%)' } }
      },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderSeasonalChart() {
  const ctx = document.getElementById('chart-seasonal');
  if (!ctx) return;
  window.HealthAI.destroyChart('seasonal');

  window.HealthAI.charts['seasonal'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        { label: 'Diabetes', data: [120, 95, 85, 130], backgroundColor: chartColors.cyanAlpha.replace('0.15','0.6') },
        { label: 'Heart Disease', data: [140, 100, 80, 150], backgroundColor: chartColors.roseAlpha.replace('0.15','0.6') },
        { label: 'Stroke', data: [110, 85, 75, 125], backgroundColor: chartColors.purpleAlpha.replace('0.15','0.6') }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function renderVolumeChart() {
  const ctx = document.getElementById('chart-volume');
  if (!ctx) return;
  window.HealthAI.destroyChart('volume');

  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  window.HealthAI.charts['volume'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [{
        label: 'Predictions',
        data: [45, 52, 48, 65, 72, 68, 80, 85],
        borderColor: chartColors.cyan,
        backgroundColor: chartColors.cyanAlpha,
        fill: true,
        pointBackgroundColor: chartColors.cyan
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}
