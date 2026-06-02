/* ============================================================
   App Controller — SPA Navigation, State, Chart Config
   ============================================================ */

// ---- Global State ----
window.HealthAI = {
  predictions: [],
  currentPage: 'dashboard',
  charts: {},

  addPrediction(prediction) {
    this.predictions.unshift({
      ...prediction,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    // Keep last 50
    if (this.predictions.length > 50) this.predictions.pop();
    // Save to localStorage
    try {
      localStorage.setItem('healthai_predictions', JSON.stringify(this.predictions));
    } catch (e) { /* ignore */ }
  },

  loadPredictions() {
    try {
      const saved = localStorage.getItem('healthai_predictions');
      if (saved) this.predictions = JSON.parse(saved);
    } catch (e) { /* ignore */ }
  },

  getLatestByDisease(disease) {
    return this.predictions.find(p => p.disease === disease);
  },

  destroyChart(id) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  }
};

// ---- Chart.js Global Defaults (Dark Theme) ----
function configureChartDefaults() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = 'hsl(215, 20%, 68%)';
  Chart.defaults.borderColor = 'hsla(220, 50%, 60%, 0.08)';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = 'hsla(222, 40%, 14%, 0.95)';
  Chart.defaults.plugins.tooltip.borderColor = 'hsla(220, 50%, 60%, 0.2)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
  Chart.defaults.elements.arc.borderWidth = 0;
  Chart.defaults.elements.bar.borderRadius = 4;
  Chart.defaults.elements.line.tension = 0.35;
  Chart.defaults.elements.point.radius = 3;
  Chart.defaults.elements.point.hoverRadius = 6;
  Chart.defaults.scale.grid = { color: 'hsla(220, 50%, 60%, 0.06)' };
}

// ---- SPA Navigation ----
function navigateTo(page) {
  // Update active nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update active section
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.toggle('active', section.id === `page-${page}`);
  });

  // Update hash
  window.location.hash = page;
  window.HealthAI.currentPage = page;

  // Initialize page content
  initPage(page);

  // Close mobile menu
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('active');

  // Scroll to top
  document.getElementById('mainContent').scrollTo(0, 0);
}

function initPage(page) {
  switch (page) {
    case 'dashboard':
      if (typeof initDashboard === 'function') initDashboard();
      break;
    case 'diabetes':
      if (typeof initDiabetes === 'function') initDiabetes();
      break;
    case 'heart':
      if (typeof initHeart === 'function') initHeart();
      break;
    case 'liver':
      if (typeof initLiver === 'function') initLiver();
      break;
    case 'stroke':
      if (typeof initStroke === 'function') initStroke();
      break;
    case 'explainableAI':
      if (typeof initExplainableAI === 'function') initExplainableAI();
      break;
    case 'analytics':
      if (typeof initAnalytics === 'function') initAnalytics();
      break;
    case 'report':
      if (typeof initReportGenerator === 'function') initReportGenerator();
      break;
    case 'recommendations':
      if (typeof initRecommendations === 'function') initRecommendations();
      break;
  }
}

// ---- Animated Counter ----
function animateCounter(element, target, duration = 1200, prefix = '', suffix = '') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(start + (target - start) * eased);
    element.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---- Utility: Risk Level ----
function getRiskLevel(score) {
  if (score < 35) return { level: 'Low', class: 'low', badge: 'badge-success' };
  if (score < 65) return { level: 'Medium', class: 'medium', badge: 'badge-warning' };
  return { level: 'High', class: 'high', badge: 'badge-danger' };
}

// ---- Utility: Format Date ----
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ---- Chart Color Palette ----
const chartColors = {
  cyan: 'hsl(174, 80%, 48%)',
  cyanAlpha: 'hsla(174, 80%, 48%, 0.15)',
  blue: 'hsl(215, 90%, 60%)',
  blueAlpha: 'hsla(215, 90%, 60%, 0.15)',
  purple: 'hsl(265, 80%, 65%)',
  purpleAlpha: 'hsla(265, 80%, 65%, 0.15)',
  amber: 'hsl(38, 92%, 55%)',
  amberAlpha: 'hsla(38, 92%, 55%, 0.15)',
  rose: 'hsl(350, 80%, 60%)',
  roseAlpha: 'hsla(350, 80%, 60%, 0.15)',
  emerald: 'hsl(160, 70%, 48%)',
  emeraldAlpha: 'hsla(160, 70%, 48%, 0.15)',
  indigo: 'hsl(235, 75%, 62%)',
  indigoAlpha: 'hsla(235, 75%, 62%, 0.15)',
};

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  configureChartDefaults();
  window.HealthAI.loadPredictions();

  // Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Nav click handlers
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Hash-based routing
  const hash = window.location.hash.slice(1);
  if (hash) {
    navigateTo(hash);
  } else {
    navigateTo('dashboard');
  }
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && hash !== window.HealthAI.currentPage) {
    navigateTo(hash);
  }
});
