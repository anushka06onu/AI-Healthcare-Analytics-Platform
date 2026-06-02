/* ============================================================
   Report Generator Module — PDF Export
   ============================================================ */

function initReportGenerator() {
  const container = document.getElementById('report-content');
  if (!container) return;

  const predictions = window.HealthAI.predictions;

  container.innerHTML = `
    <div class="grid-1-2">
      <!-- Config Panel -->
      <div class="glass-card">
        <div class="glass-card-header">
          <div>
            <div class="glass-card-title">Report Configuration</div>
            <div class="glass-card-subtitle">Configure and generate PDF reports</div>
          </div>
        </div>
        <form id="report-config" autocomplete="off">
          <div class="form-group mb-lg">
            <label class="form-label" for="rpt-name">Patient Name</label>
            <input type="text" class="form-input" id="rpt-name" placeholder="Enter patient name" value="John Doe">
          </div>
          <div class="form-group mb-lg">
            <label class="form-label" for="rpt-id">Patient ID</label>
            <input type="text" class="form-input" id="rpt-id" placeholder="e.g., PAT-001" value="PAT-${String(Date.now()).slice(-5)}">
          </div>
          <div class="form-group mb-lg">
            <label class="form-label" for="rpt-date">Report Date</label>
            <input type="date" class="form-input" id="rpt-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group mb-lg">
            <label class="form-label">Include Disease Assessments</label>
            <div class="flex flex-col gap-sm mt-sm">
              <label class="form-checkbox-group">
                <input type="checkbox" class="form-checkbox" id="rpt-diabetes" checked> Diabetes
              </label>
              <label class="form-checkbox-group">
                <input type="checkbox" class="form-checkbox" id="rpt-heart" checked> Heart Disease
              </label>
              <label class="form-checkbox-group">
                <input type="checkbox" class="form-checkbox" id="rpt-liver" checked> Liver Disease
              </label>
              <label class="form-checkbox-group">
                <input type="checkbox" class="form-checkbox" id="rpt-stroke" checked> Stroke
              </label>
            </div>
          </div>
          <div class="form-group mb-lg">
            <label class="form-checkbox-group">
              <input type="checkbox" class="form-checkbox" id="rpt-recommendations" checked> Include Recommendations
            </label>
          </div>
        </form>
        <div class="btn-group mt-xl">
          <button class="btn btn-primary btn-lg" id="generate-pdf-btn">
            <i data-lucide="download"></i> Download PDF
          </button>
          <button class="btn btn-secondary" id="preview-report-btn">
            <i data-lucide="eye"></i> Preview
          </button>
        </div>
      </div>

      <!-- Report Preview -->
      <div>
        <div class="glass-card" id="report-preview-wrapper">
          <div class="glass-card-header">
            <div>
              <div class="glass-card-title">Report Preview</div>
              <div class="glass-card-subtitle">Click "Preview" to generate the report view</div>
            </div>
          </div>
          <div id="report-preview-container">
            <div class="empty-state">
              <i data-lucide="file-text"></i>
              <p>Configure settings and click <strong>Preview</strong> to see the report.</p>
              ${predictions.length === 0 ? '<p class="text-xs text-muted">Tip: Run some disease predictions first for a complete report.</p>' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  document.getElementById('preview-report-btn').addEventListener('click', previewReport);
  document.getElementById('generate-pdf-btn').addEventListener('click', generatePDF);
}

function getReportData() {
  const name = document.getElementById('rpt-name').value || 'N/A';
  const id = document.getElementById('rpt-id').value || 'N/A';
  const date = document.getElementById('rpt-date').value || new Date().toISOString().split('T')[0];
  const includeDiabetes = document.getElementById('rpt-diabetes').checked;
  const includeHeart = document.getElementById('rpt-heart').checked;
  const includeLiver = document.getElementById('rpt-liver').checked;
  const includeStroke = document.getElementById('rpt-stroke').checked;
  const includeRecs = document.getElementById('rpt-recommendations').checked;

  const diseases = [];
  if (includeDiabetes) diseases.push('Diabetes');
  if (includeHeart) diseases.push('Heart Disease');
  if (includeLiver) diseases.push('Liver Disease');
  if (includeStroke) diseases.push('Stroke');

  const results = {};
  diseases.forEach(d => {
    const pred = window.HealthAI.getLatestByDisease(d);
    results[d] = pred || { riskScore: 0, riskLevel: 'N/A', disease: d };
  });

  return { name, id, date, diseases, results, includeRecs };
}

function previewReport() {
  const data = getReportData();
  const preview = document.getElementById('report-preview-container');

  let html = `
    <div class="report-preview" id="report-content-printable">
      <h1>🏥 AI Healthcare Analytics Report</h1>

      <h2>Patient Information</h2>
      <table>
        <tr><th>Patient Name</th><td>${data.name}</td></tr>
        <tr><th>Patient ID</th><td>${data.id}</td></tr>
        <tr><th>Report Date</th><td>${data.date}</td></tr>
        <tr><th>Generated By</th><td>AI Healthcare Analytics Platform v1.0</td></tr>
      </table>

      <h2>Disease Risk Assessment Summary</h2>
      <table>
        <thead>
          <tr><th>Disease</th><th>Risk Score</th><th>Risk Level</th><th>Assessment Date</th></tr>
        </thead>
        <tbody>
  `;

  data.diseases.forEach(d => {
    const r = data.results[d];
    const color = r.riskLevel === 'High' ? '#e74c3c' : r.riskLevel === 'Medium' ? '#f39c12' : r.riskLevel === 'Low' ? '#2ecc71' : '#888';
    html += `
      <tr>
        <td style="font-weight:600;">${d}</td>
        <td>${typeof r.riskScore === 'number' ? r.riskScore.toFixed(1) + '%' : 'Not assessed'}</td>
        <td style="color:${color}; font-weight:600;">${r.riskLevel}</td>
        <td>${r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
  `;

  // Detailed results per disease
  data.diseases.forEach(d => {
    const r = data.results[d];
    if (r.factors) {
      html += `<h2>${d} — Detailed Analysis</h2>`;
      html += `<table><thead><tr><th>Risk Factor</th><th>Impact Score</th><th>Impact Level</th></tr></thead><tbody>`;
      Object.entries(r.factors).sort((a, b) => b[1] - a[1]).forEach(([factor, value]) => {
        const level = value >= 12 ? 'High' : value >= 5 ? 'Moderate' : 'Low';
        const color = level === 'High' ? '#e74c3c' : level === 'Moderate' ? '#f39c12' : '#2ecc71';
        html += `<tr><td>${factor}</td><td>${value}</td><td style="color:${color};font-weight:600;">${level}</td></tr>`;
      });
      html += `</tbody></table>`;
    }
  });

  if (data.includeRecs) {
    html += `
      <h2>Recommendations</h2>
      <table>
        <thead><tr><th>Category</th><th>Recommendation</th><th>Priority</th></tr></thead>
        <tbody>
    `;

    const highRisk = data.diseases.filter(d => data.results[d].riskLevel === 'High');
    const medRisk = data.diseases.filter(d => data.results[d].riskLevel === 'Medium');

    if (highRisk.length > 0) {
      html += `<tr><td>Medical</td><td>Immediate consultation for: ${highRisk.join(', ')}</td><td style="color:#e74c3c;font-weight:600;">Critical</td></tr>`;
    }
    html += `
      <tr><td>Lifestyle</td><td>Maintain regular physical activity (150 min/week moderate exercise)</td><td style="color:#f39c12;font-weight:600;">Important</td></tr>
      <tr><td>Diet</td><td>Follow a balanced diet low in saturated fats, sodium, and added sugars</td><td style="color:#f39c12;font-weight:600;">Important</td></tr>
      <tr><td>Monitoring</td><td>Regular health check-ups every 6 months</td><td style="color:#2ecc71;font-weight:600;">Suggested</td></tr>
      <tr><td>Mental Health</td><td>Stress management through meditation or counseling</td><td style="color:#2ecc71;font-weight:600;">Suggested</td></tr>
    `;
    html += `</tbody></table>`;
  }

  html += `
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;">
      <p><strong>Disclaimer:</strong> This report is generated by an AI system for educational and informational purposes only.
      It should NOT be used as a substitute for professional medical advice, diagnosis, or treatment.
      Always consult a qualified healthcare provider.</p>
      <p>Generated: ${new Date().toLocaleString()} | AI Healthcare Analytics Platform v1.0</p>
    </div>
  </div>`;

  preview.innerHTML = html;
}

async function generatePDF() {
  // First preview the report
  previewReport();

  const preview = document.getElementById('report-content-printable');
  if (!preview) return;

  const btn = document.getElementById('generate-pdf-btn');
  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader"></i> Generating...';

  try {
    // Use jsPDF with html2canvas
    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas(preview, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8f8f8'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const data = getReportData();
    pdf.save(`HealthAI_Report_${data.id}_${data.date}.pdf`);
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('PDF generation failed. Please make sure all libraries are loaded.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="download"></i> Download PDF';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}
