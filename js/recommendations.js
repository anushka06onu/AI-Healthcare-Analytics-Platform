/* ============================================================
   Recommendation System Module
   ============================================================ */

const recommendationDatabase = {
  Diabetes: {
    high: [
      { category: 'Medical', icon: 'stethoscope', color: 'rose', priority: 'Critical', items: [
        'Schedule immediate HbA1c blood test',
        'Consult endocrinologist within 1 week',
        'Begin continuous glucose monitoring (CGM)',
        'Review and adjust current medications with your doctor'
      ]},
      { category: 'Diet', icon: 'apple', color: 'emerald', priority: 'Critical', items: [
        'Adopt a low glycemic index (GI) diet immediately',
        'Limit carbohydrate intake to 45-60g per meal',
        'Eliminate sugary beverages and processed foods',
        'Increase dietary fiber to 25-30g daily'
      ]},
      { category: 'Exercise', icon: 'dumbbell', color: 'blue', priority: 'Important', items: [
        'Start with 30 minutes of walking daily',
        'Include resistance training 2-3 times per week',
        'Monitor blood sugar before and after exercise',
        'Gradually increase to 150 min/week moderate activity'
      ]}
    ],
    medium: [
      { category: 'Lifestyle', icon: 'heart', color: 'cyan', priority: 'Important', items: [
        'Maintain a regular meal schedule',
        'Aim for 7-8 hours of quality sleep',
        'Manage stress through mindfulness or yoga',
        'Limit alcohol consumption'
      ]},
      { category: 'Monitoring', icon: 'activity', color: 'amber', priority: 'Suggested', items: [
        'Check fasting glucose weekly',
        'Schedule HbA1c test every 3 months',
        'Track BMI and waist circumference monthly',
        'Keep a food diary for 2 weeks'
      ]}
    ],
    low: [
      { category: 'Prevention', icon: 'shield', color: 'emerald', priority: 'Suggested', items: [
        'Continue balanced nutrition and active lifestyle',
        'Annual diabetes screening recommended',
        'Maintain healthy BMI (18.5-24.9)',
        'Stay hydrated with water'
      ]}
    ]
  },
  'Heart Disease': {
    high: [
      { category: 'Medical', icon: 'stethoscope', color: 'rose', priority: 'Critical', items: [
        'Schedule cardiology appointment immediately',
        'Get an ECG and echocardiogram',
        'Request lipid panel and cardiac enzyme tests',
        'Discuss statin therapy with your doctor'
      ]},
      { category: 'Diet', icon: 'apple', color: 'emerald', priority: 'Critical', items: [
        'Adopt the DASH or Mediterranean diet',
        'Reduce sodium intake to under 1,500 mg/day',
        'Increase omega-3 fatty acids (fish, nuts, flaxseed)',
        'Eliminate trans fats completely'
      ]}
    ],
    medium: [
      { category: 'Exercise', icon: 'dumbbell', color: 'blue', priority: 'Important', items: [
        'Engage in 150 minutes of moderate aerobic activity weekly',
        'Include daily walking for cardiovascular health',
        'Avoid heavy lifting without clearance',
        'Practice deep breathing exercises'
      ]},
      { category: 'Monitoring', icon: 'activity', color: 'amber', priority: 'Important', items: [
        'Monitor blood pressure daily',
        'Check cholesterol every 3-6 months',
        'Track resting heart rate trends',
        'Log symptoms like chest pain or shortness of breath'
      ]}
    ],
    low: [
      { category: 'Prevention', icon: 'shield', color: 'emerald', priority: 'Suggested', items: [
        'Maintain regular cardiovascular exercise',
        'Annual cardiac check-up recommended',
        'Keep cholesterol below 200 mg/dL',
        'Manage stress proactively'
      ]}
    ]
  },
  'Liver Disease': {
    high: [
      { category: 'Medical', icon: 'stethoscope', color: 'rose', priority: 'Critical', items: [
        'Consult a hepatologist immediately',
        'Get liver ultrasound and FibroScan',
        'Complete hepatitis panel (A, B, C)',
        'Review all medications for hepatotoxicity'
      ]},
      { category: 'Diet', icon: 'apple', color: 'emerald', priority: 'Critical', items: [
        'Completely abstain from alcohol',
        'Follow a low-fat, high-protein diet',
        'Avoid processed and fried foods',
        'Include liver-supportive foods: leafy greens, cruciferous vegetables'
      ]}
    ],
    medium: [
      { category: 'Lifestyle', icon: 'heart', color: 'cyan', priority: 'Important', items: [
        'Reduce alcohol to minimal or none',
        'Maintain a healthy weight',
        'Avoid unnecessary OTC medications (esp. acetaminophen)',
        'Get vaccinated for hepatitis A and B'
      ]}
    ],
    low: [
      { category: 'Prevention', icon: 'shield', color: 'emerald', priority: 'Suggested', items: [
        'Limit alcohol consumption',
        'Annual liver function test recommended',
        'Maintain healthy weight and exercise regularly',
        'Stay hydrated and eat balanced meals'
      ]}
    ]
  },
  Stroke: {
    high: [
      { category: 'Medical', icon: 'stethoscope', color: 'rose', priority: 'Critical', items: [
        'Immediate neurology consultation required',
        'Get carotid doppler ultrasound',
        'Optimize blood pressure control (target: <130/80)',
        'Discuss anticoagulation therapy if indicated'
      ]},
      { category: 'Emergency', icon: 'alert-triangle', color: 'amber', priority: 'Critical', items: [
        'Learn the FAST signs: Face drooping, Arm weakness, Speech difficulty, Time to call 911',
        'Keep emergency contacts easily accessible',
        'Consider wearing a medical alert bracelet',
        'Create an emergency action plan'
      ]}
    ],
    medium: [
      { category: 'Lifestyle', icon: 'heart', color: 'cyan', priority: 'Important', items: [
        'Quit smoking (if applicable)',
        'Manage blood pressure daily',
        'Maintain blood sugar in normal range',
        'Engage in regular physical activity'
      ]},
      { category: 'Diet', icon: 'apple', color: 'emerald', priority: 'Important', items: [
        'Follow a low-sodium, low-fat diet',
        'Increase fruit and vegetable intake to 5+ servings/day',
        'Limit red meat; choose fish and poultry',
        'Reduce caffeine intake'
      ]}
    ],
    low: [
      { category: 'Prevention', icon: 'shield', color: 'emerald', priority: 'Suggested', items: [
        'Annual stroke risk screening',
        'Maintain active lifestyle and healthy weight',
        'Manage stress through regular relaxation',
        'Know the warning signs of stroke'
      ]}
    ]
  }
};

function initRecommendations() {
  const container = document.getElementById('recommendations-content');
  if (!container) return;

  const predictions = window.HealthAI.predictions;
  const latestByDisease = {};
  ['Diabetes', 'Heart Disease', 'Liver Disease', 'Stroke'].forEach(d => {
    const pred = window.HealthAI.getLatestByDisease(d);
    if (pred) latestByDisease[d] = pred;
  });

  const hasPredictions = Object.keys(latestByDisease).length > 0;

  let html = '';

  if (hasPredictions) {
    // Summary bar
    html += `
      <div class="stats-grid stagger-children mb-xl">
    `;
    Object.entries(latestByDisease).forEach(([disease, pred]) => {
      const risk = getRiskLevel(pred.riskScore);
      const colorMap = { low: 'emerald', medium: 'amber', high: 'rose' };
      const c = colorMap[risk.class];
      html += `
        <div class="stat-card ${c}">
          <div class="stat-icon ${c}"><i data-lucide="${risk.class === 'low' ? 'shield-check' : risk.class === 'medium' ? 'alert-triangle' : 'alert-octagon'}"></i></div>
          <div class="stat-info">
            <div class="stat-label">${disease}</div>
            <div class="stat-value">${pred.riskScore.toFixed(0)}%</div>
            <div class="stat-change ${risk.class === 'low' ? 'positive' : 'negative'}">
              <span class="badge ${risk.badge}">${risk.level} Risk</span>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    // Personalized recommendations
    html += `<h2 style="font-size: var(--font-xl); font-weight: 700; margin-bottom: var(--space-lg);">Personalized Recommendations</h2>`;

    // Sort diseases by risk (high first)
    const sorted = Object.entries(latestByDisease).sort((a, b) => b[1].riskScore - a[1].riskScore);

    sorted.forEach(([disease, pred]) => {
      const risk = getRiskLevel(pred.riskScore);
      const recs = recommendationDatabase[disease];
      if (!recs) return;

      // Get appropriate recommendations
      let items = [];
      if (risk.class === 'high') items = [...(recs.high || []), ...(recs.medium || [])];
      else if (risk.class === 'medium') items = [...(recs.medium || []), ...(recs.low || [])];
      else items = recs.low || [];

      html += `
        <div class="mb-xl">
          <div class="flex items-center gap-md mb-lg">
            <span class="badge ${risk.badge}" style="font-size: var(--font-sm); padding: 6px 14px;">${disease} — ${risk.level} Risk</span>
          </div>
          <div class="grid-3 stagger-children">
      `;

      items.forEach(rec => {
        html += `
          <div class="rec-card">
            <div class="rec-card-header">
              <div class="rec-icon ${rec.color}" style="background: var(--glass-hover);">
                <i data-lucide="${rec.icon}" style="width:20px;height:20px;color:var(--accent-${rec.color});"></i>
              </div>
              <div>
                <div class="rec-card-title">${rec.category}</div>
              </div>
              <span class="rec-priority badge ${rec.priority === 'Critical' ? 'badge-danger' : rec.priority === 'Important' ? 'badge-warning' : 'badge-success'}">${rec.priority}</span>
            </div>
            <div class="rec-card-body">
              <ul>
                ${rec.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

  } else {
    // No predictions yet
    html += `
      <div class="glass-card">
        <div class="empty-state">
          <i data-lucide="lightbulb"></i>
          <p>No predictions available yet.</p>
          <p class="text-sm text-muted mb-lg">Run disease predictions first to get personalized health recommendations.</p>
          <div class="btn-group justify-center">
            <button class="btn btn-primary" onclick="navigateTo('diabetes')"><i data-lucide="droplets"></i> Diabetes</button>
            <button class="btn btn-secondary" onclick="navigateTo('heart')"><i data-lucide="heart-pulse"></i> Heart</button>
            <button class="btn btn-secondary" onclick="navigateTo('liver')"><i data-lucide="bean"></i> Liver</button>
            <button class="btn btn-secondary" onclick="navigateTo('stroke')"><i data-lucide="brain"></i> Stroke</button>
          </div>
        </div>
      </div>
    `;
  }

  // General recommendations always shown
  html += `
    <div class="glass-card mt-xl">
      <div class="glass-card-header">
        <div>
          <div class="glass-card-title">General Health Guidelines</div>
          <div class="glass-card-subtitle">Universal recommendations for overall wellness</div>
        </div>
      </div>
      <div class="grid-3 stagger-children mt-md">
        <div class="rec-card">
          <div class="rec-card-header">
            <div class="rec-icon cyan" style="background: var(--glass-hover);">
              <i data-lucide="droplet" style="width:20px;height:20px;color:var(--accent-cyan);"></i>
            </div>
            <div class="rec-card-title">Hydration</div>
          </div>
          <div class="rec-card-body">
            <ul>
              <li>Drink 8-10 glasses of water daily</li>
              <li>Limit sugary drinks and excessive caffeine</li>
              <li>Increase intake during exercise</li>
            </ul>
          </div>
        </div>
        <div class="rec-card">
          <div class="rec-card-header">
            <div class="rec-icon purple" style="background: var(--glass-hover);">
              <i data-lucide="moon" style="width:20px;height:20px;color:var(--accent-purple);"></i>
            </div>
            <div class="rec-card-title">Sleep</div>
          </div>
          <div class="rec-card-body">
            <ul>
              <li>Aim for 7-9 hours of quality sleep</li>
              <li>Maintain consistent sleep schedule</li>
              <li>Avoid screens 1 hour before bed</li>
            </ul>
          </div>
        </div>
        <div class="rec-card">
          <div class="rec-card-header">
            <div class="rec-icon amber" style="background: var(--glass-hover);">
              <i data-lucide="brain" style="width:20px;height:20px;color:var(--accent-amber);"></i>
            </div>
            <div class="rec-card-title">Mental Wellness</div>
          </div>
          <div class="rec-card-body">
            <ul>
              <li>Practice daily mindfulness or meditation</li>
              <li>Stay socially connected</li>
              <li>Seek professional help when needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
