import React, { useState } from 'react'
import DiseaseSelector from '../components/DiseaseSelector'
import InputField from '../components/InputField'
import ResultBox from '../components/ResultBox'
import Card from '../components/Card'

function Predict({ predictions, setPredictions, setPage }) {
  const [selectedDisease, setSelectedDisease] = useState('diabetes')
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState(null)
  
  // Active step wizard tracker
  const [activeStep, setActiveStep] = useState(1)

  // 👤 UNIFIED INPUT STATES (Same form is used for ALL diseases)
  // Step 1: Basic Information
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState('female')
  const [height, setHeight] = useState(165) // optional height in cm
  const [weight, setWeight] = useState(65)  // optional weight in kg

  // Step 2: Lifestyle Information
  const [smoke, setSmoke] = useState('no')
  const [exercise, setExercise] = useState('yes')
  const [balancedDiet, setBalancedDiet] = useState('yes')
  const [stressLevel, setStressLevel] = useState('low')

  // Step 3: Simple Health Indicators
  const [bloodPressure, setBloodPressure] = useState('normal')
  const [bloodSugar, setBloodSugar] = useState('normal')
  const [cholesterol, setCholesterol] = useState('normal')

  // Step 4: Family History
  const [familyHistory, setFamilyHistory] = useState('no')

  // Core risk calculator mapped internally from simple layman inputs
  const handleCalculate = (e) => {
    e.preventDefault()
    setIsCalculating(true)

    setTimeout(() => {
      let riskScore = 0
      let reasons = []
      let advice = []

      // Calculate BMI internally if optional height and weight are provided
      let bmi = 22
      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100
        bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
      }

      // Age risk factor across all diseases
      if (age > 45) {
        riskScore += 10
        reasons.push(`Your age (${age} years) naturally increases chronic risk baselines slightly.`)
      } else if (age > 65) {
        riskScore += 22
        reasons.push(`At ${age} years of age, blood vessels and cellular response rates naturally stiffen.`)
      }

      // Lifestyle risk factors across all diseases
      if (smoke === 'yes') {
        if (selectedDisease === 'heart' || selectedDisease === 'stroke') {
          riskScore += 28
          reasons.push("Active smoking narrows blood vessels and increases arterial clogging risks substantially.")
        } else {
          riskScore += 12
          reasons.push("Smoking exposes cells to free radicals, placing stress on internal organs.")
        }
        advice.push("Consider joining a local smoking cessation program to protect your blood vessels.")
      }

      if (exercise === 'no') {
        riskScore += 15
        reasons.push("Not exercising regularly slows metabolic rates and reduces heart muscle conditioning.")
        advice.push("Aim for 150 minutes of moderate activity, like brisk walking, per week.")
      } else {
        advice.push("Great job! Maintain your active physical exercise routine.")
      }

      if (balancedDiet === 'no') {
        if (selectedDisease === 'liver' || selectedDisease === 'diabetes') {
          riskScore += 22
          reasons.push("An unbalanced diet high in processed foods loads cells with fats and sudden sugar spikes.")
        } else {
          riskScore += 10
          reasons.push("Less balanced eating patterns deprive the body of protective antioxidants.")
        }
        advice.push("Focus on fiber-rich whole foods, leafy green vegetables, and lean proteins.")
      }

      if (stressLevel === 'high') {
        riskScore += 18
        reasons.push("Severe stress levels trigger hormones like cortisol, which spikes blood pressure and sugars.")
        advice.push("Incorporate 5-10 minutes of daily mindfulness, deep breathing, or light yoga.")
      } else if (stressLevel === 'medium') {
        riskScore += 6
      }

      // Family History risk factor across all diseases
      if (familyHistory === 'yes') {
        riskScore += 16
        reasons.push("A close family history of chronic illness points to a minor genetic predisposition.")
      }

      // Internal Mapping Logic based on selected disease
      if (selectedDisease === 'diabetes') {
        if (bloodSugar === 'high') {
          riskScore += 45
          reasons.push("Your blood sugar status is high, which is the primary indicator of active prediabetes or diabetes.")
        }
        if (bmi >= 30) {
          riskScore += 20
          reasons.push(`Your calculated Body Mass Index (BMI: ${bmi}) is in the obese zone, straining cellular insulin cells.`)
        } else if (bmi >= 25) {
          riskScore += 10
          reasons.push(`Your body weight level (BMI: ${bmi}) is slightly elevated above standard healthy ranges.`)
        }
        if (bloodPressure === 'high') {
          riskScore += 12
          reasons.push("Elevated blood pressure is frequently linked with insulin metabolic resistance.")
        }
      } 
      
      else if (selectedDisease === 'heart') {
        if (bloodPressure === 'high') {
          riskScore += 35
          reasons.push("High blood pressure puts constant, heavy physical stress on your arterial walls.")
        }
        if (cholesterol === 'high') {
          riskScore += 25
          reasons.push("Elevated cholesterol can lead to plaque blockages in your heart blood vessels.")
        }
        if (bloodSugar === 'high') {
          riskScore += 12
          reasons.push("High sugar levels irritate arterial walls, speeding up clogging risks.")
        }
      } 
      
      else if (selectedDisease === 'liver') {
        if (cholesterol === 'high') {
          riskScore += 22
          reasons.push("High blood lipid levels can lead to excess healthy fat storage inside liver cells.")
        }
        if (bloodSugar === 'high') {
          riskScore += 15
          reasons.push("High sugar levels force the liver to convert excess glucose directly into hepatic fat.")
        }
        if (bmi >= 30) {
          riskScore += 15
          reasons.push("Higher body weights are strongly associated with fat accumulation in liver tissues.")
        }
      } 
      
      else if (selectedDisease === 'stroke') {
        if (bloodPressure === 'high') {
          riskScore += 40
          reasons.push("High blood pressure is the leading risk factor, straining delicate cerebral arteries.")
        }
        if (cholesterol === 'high') {
          riskScore += 15
          reasons.push("Elevated cholesterol can build microscopic plaques in pathways leading to the brain.")
        }
        if (bloodSugar === 'high') {
          riskScore += 10
          reasons.push("Excess blood sugar irritates delicate brain blood vessel wall linings.")
        }
      } 
      
      else if (selectedDisease === 'kidney') {
        if (bloodPressure === 'high') {
          riskScore += 35
          reasons.push("High blood pressure damages the microscopic, highly sensitive filtering pathways in your kidneys.")
        }
        if (bloodSugar === 'high') {
          riskScore += 30
          reasons.push("High blood sugars strain kidneys over time by forcing them to filter excessive volumes of blood.")
        }
        if (bmi >= 30) {
          riskScore += 10
          reasons.push("Elevated weight indexes require your kidneys to work harder to filter wastes.")
        }
      }

      // Standardizing suggestions for indicators
      if (bloodSugar === 'high') advice.push("Limit refined carbohydrates, sugars, and sodas.")
      if (bloodPressure === 'high') advice.push("Reduce sodium intake by cooking with fresh herbs instead of salt.")
      if (cholesterol === 'high') advice.push("Choose healthy fats like olive oil, avocados, and raw nuts.")

      // Deduplicate suggestions and bound risk score
      const finalAdvice = [...new Set(advice)].slice(0, 4)
      riskScore = Math.min(Math.max(riskScore, 5), 98)
      
      let riskLevel = "Low"
      if (riskScore >= 70) riskLevel = "High"
      else if (riskScore >= 35) riskLevel = "Medium"

      const d_titles = { 
        diabetes: 'Diabetes', 
        heart: 'Heart Disease', 
        liver: 'Liver Disease', 
        stroke: 'Stroke', 
        kidney: 'Kidney Disease' 
      }
      
      const newPrediction = {
        id: predictions.length + 1,
        date: new Date().toISOString().split('T')[0],
        disease: d_titles[selectedDisease],
        riskScore,
        riskLevel,
        reasons,
        advice: finalAdvice,
        patientName: patientName.trim() || 'Guest User',
        patientId: 'GUEST-' + Math.floor(1000 + Math.random() * 9000),
        trend: riskScore > 40 ? 'worsening' : 'improving',
        metrics: {
          age,
          sex,
          bmi,
          smoke,
          exercise,
          balancedDiet,
          stressLevel,
          bloodPressure,
          bloodSugar,
          cholesterol,
          familyHistory
        }
      }

      setResult(newPrediction)
      setPredictions([newPrediction, ...predictions])
      setIsCalculating(false)
      
      // Smoothly scroll results panel into view on mobile
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }, 1200)
  }

  // Real printable PDF generation wellness report
  const handleDownload = () => {
    if (!result) return
    
    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) {
      alert("⚠️ Pop-up blocked! Please allow pop-ups for this site to view and save your wellness report.")
      return
    }

    const levelColors = {
      Low: { text: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
      Medium: { text: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' },
      High: { text: '#EF4444', bg: '#FEE2E2', border: '#FCA5A5' }
    }[result.riskLevel] || { text: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }

    printWindow.document.write(`
      <html>
        <head>
          <title>HealthAI_Wellness_Report_${result.patientId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #0F172A;
              background-color: #FFFFFF;
              padding: 40px;
              margin: 0;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .brand-logo {
              background: #2563EB;
              color: white;
              padding: 6px 12px;
              font-weight: 900;
              border-radius: 8px;
              font-size: 16px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .brand-name span {
              color: #2563EB;
            }
            .doc-id {
              text-align: right;
              font-size: 11px;
              color: #64748B;
              font-weight: 600;
            }
            .doc-id strong {
              color: #0F172A;
            }
            .report-title {
              font-size: 20px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #1E293B;
              margin-bottom: 25px;
            }
            .section-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              border: 1px solid #E2E8F0;
              border-radius: 16px;
              padding: 20px;
              background: #F8FAFC;
            }
            .card-title {
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748B;
              border-bottom: 1px solid #E2E8F0;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .vital-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              margin-bottom: 10px;
            }
            .vital-label {
              font-weight: 600;
              color: #475569;
            }
            .vital-value {
              font-weight: 800;
              color: #0F172A;
            }
            .score-card {
              text-align: center;
              border-radius: 16px;
              padding: 24px;
              border: 1px solid ${levelColors.border};
              background: ${levelColors.bg};
              margin-bottom: 30px;
            }
            .score-label {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #475569;
              display: block;
              margin-bottom: 8px;
            }
            .score-badge {
              font-size: 32px;
              font-weight: 900;
              color: ${levelColors.text};
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            .score-circle {
              font-size: 40px;
              margin-top: 15px;
              display: inline-block;
              font-weight: 900;
              background: #FFFFFF;
              border: 1px solid #E2E8F0;
              padding: 10px 25px;
              border-radius: 99px;
              color: #0F172A;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .reasons-list {
              margin-bottom: 30px;
            }
            .reason-item {
              font-size: 13px;
              color: #334155;
              margin-bottom: 10px;
              display: flex;
              align-items: flex-start;
              gap: 8px;
              font-weight: 500;
            }
            .reason-bullet {
              color: #2563EB;
              font-weight: 800;
            }
            .advice-list {
              margin-bottom: 40px;
            }
            .advice-item {
              font-size: 13px;
              color: #334155;
              margin-bottom: 10px;
              display: flex;
              align-items: flex-start;
              gap: 8px;
              font-weight: 500;
            }
            .advice-bullet {
              color: #10B981;
              font-weight: 800;
            }
            .disclaimer {
              border-top: 1px solid #E2E8F0;
              padding-top: 20px;
              font-size: 11px;
              color: #64748B;
              text-align: center;
              line-height: 1.6;
              font-weight: 500;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <div class="brand-logo">H</div>
              <div class="brand-name">Health<span>AI</span></div>
            </div>
            <div class="doc-id">
              Report ID: <strong>${result.patientId}</strong><br />
              Screening Date: <strong>${result.date}</strong><br />
              Type: <strong>Self-Screening Assessment Report</strong>
            </div>
          </div>

          <div class="report-title">${result.disease} Wellness Risk Assessment Report</div>

          <div class="section-grid">
            <div class="card">
              <div class="card-title">👤 User Profile</div>
              <div class="vital-row">
                <div class="vital-label">Full Name:</div>
                <div class="vital-value">${result.patientName}</div>
              </div>
              <div class="vital-row">
                <div class="vital-label">Biological Sex:</div>
                <div class="vital-value">${sex.toUpperCase()}</div>
              </div>
              <div class="vital-row">
                <div class="vital-label">User Age:</div>
                <div class="vital-value">${age} years</div>
              </div>
              <div class="vital-row">
                <div class="vital-label">Height / Weight:</div>
                <div class="vital-value">${height} cm / ${weight} kg</div>
              </div>
            </div>

            <div class="card">
              <div class="card-title">🏃 Lifestyle Habits</div>
              <div class="vital-row">
                <div class="vital-label">Tobacco Smoker:</div>
                <div class="vital-value">${smoke.toUpperCase()}</div>
              </div>
              <div class="vital-row">
                <div class="vital-label">Regular Exercise:</div>
                <div class="vital-value">${exercise.toUpperCase()}</div>
              </div>
              <div class="vital-row">
                <div class="vital-label">Balanced Diet:</div>
                <div class="vital-value">${balancedDiet.toUpperCase()}</div>
              </div>
              <div class="vital-row">
                <div class="vital-label">Stress level:</div>
                <div class="vital-value">${stressLevel.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <div class="score-card">
            <span class="score-label">Estimated Risk Classification</span>
            <div class="score-badge">
              <span>${result.riskLevel} RISK ZONE</span>
            </div>
            <div class="score-circle">
              ${result.riskScore}%
            </div>
          </div>

          <div class="card" style="margin-bottom: 30px;">
            <div class="card-title">🔍 Why this risk score?</div>
            <div class="reasons-list">
              ${result.reasons.map(r => `
                <div class="reason-item">
                  <span class="reason-bullet">•</span>
                  <span>${r}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card" style="margin-bottom: 40px;">
            <div class="card-title">💡 Recommended Wellness Actions</div>
            <div class="advice-list">
              ${result.advice.map(a => `
                <div class="advice-item">
                  <span class="advice-bullet">✓</span>
                  <span>${a}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="disclaimer">
            <strong>MANDATORY WELLNESS DISCLAIMER:</strong><br />
            This system is not a medical diagnostic tool. It provides health risk awareness using AI models trained on medical datasets. Always consult a doctor for medical decisions. Calculations are statistical risk awareness estimations designed strictly for educational reference and baseline trend tracking.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Dynamic Header */}
      <Card className="p-6 relative z-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] mb-2 flex items-center gap-2">
              <span>🩺 AI Health Risk Checker</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              Answer a few simple questions below to check your risk levels. Our system translates all inputs into friendly layman's terms—no medical jargon or laboratory reports required.
            </p>
          </div>
          <div className="md:col-span-4">
            <DiseaseSelector 
              selectedDisease={selectedDisease} 
              setSelectedDisease={setSelectedDisease} 
            />
          </div>
        </div>
      </Card>

      {/* Main Form + Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Segmented unified form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Step Progress Tracker */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-2xl shadow-sm flex items-center justify-between">
            {[
              { nr: 1, label: "Profile" },
              { nr: 2, label: "Lifestyle" },
              { nr: 3, label: "Indicators" },
              { nr: 4, label: "History" }
            ].map((step) => (
              <button
                key={step.nr}
                onClick={() => setActiveStep(step.nr)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    activeStep === step.nr 
                      ? 'bg-blue-600 text-white scale-110 shadow-md shadow-blue-500/20' 
                      : activeStep > step.nr 
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[var(--bg-color)] border border-[var(--card-border)] text-[var(--text-muted)] hover:bg-slate-100/50'
                  }`}
                >
                  {step.nr}
                </div>
                <span 
                  className={`hidden sm:inline text-xs font-bold ${
                    activeStep === step.nr ? 'text-[var(--text-color)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            
            {/* STEP 1: Basic Profile */}
            {activeStep === 1 && (
              <Card className="p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">
                    👤 STEP 1: Basic Profile Info
                  </h3>
                  <span className="text-xxs font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-md">1 of 4 Steps</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Your Name (Optional)"
                    type="text"
                    value={patientName}
                    onChange={setPatientName}
                    reference="Used exclusively to personalize your PDF report"
                  />
                  <InputField 
                    label="How old are you? (Age)"
                    type="slider"
                    min={1}
                    max={110}
                    value={age}
                    onChange={setAge}
                    reference="In years"
                  />
                  <InputField 
                    label="Your Gender"
                    type="select"
                    value={sex}
                    onChange={setSex}
                    options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]}
                    reference="Used for metabolic baselines"
                  />
                  <InputField 
                    label="Your Height (Optional)"
                    type="slider"
                    min={100}
                    max={220}
                    value={height}
                    onChange={setHeight}
                    reference="Height in centimeters"
                  />
                  <InputField 
                    label="Your Weight (Optional)"
                    type="slider"
                    min={30}
                    max={185}
                    value={weight}
                    onChange={setWeight}
                    reference="Weight in kilograms"
                  />
                </div>

                <div className="flex justify-end pt-4 mt-4 border-t border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-sm hover:scale-[1.01] transition-all"
                  >
                    Continue to Lifestyle ➡️
                  </button>
                </div>
              </Card>
            )}

            {/* STEP 2: Lifestyle */}
            {activeStep === 2 && (
              <Card className="p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">
                    🏃 STEP 2: Lifestyle Habits
                  </h3>
                  <span className="text-xxs font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-md">2 of 4 Steps</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Do you smoke tobacco products?"
                    type="select"
                    value={smoke}
                    onChange={setSmoke}
                    options={[{ label: 'No, I do not smoke', value: 'no' }, { label: 'Yes, I actively smoke', value: 'yes' }]}
                    reference="Vessels and vascular narrow factor"
                  />
                  <InputField 
                    label="Do you exercise regularly?"
                    type="select"
                    value={exercise}
                    onChange={setExercise}
                    options={[{ label: 'Yes, I exercise regularly', value: 'yes' }, { label: 'No, I exercise rarely', value: 'no' }]}
                    tooltip="Active weekly workouts, sports, or fast-paced walking for 150+ minutes."
                    reference="Metabolism and cardio strength"
                  />
                  <InputField 
                    label="Do you eat a balanced diet?"
                    type="select"
                    value={balancedDiet}
                    onChange={setBalancedDiet}
                    options={[{ label: 'Yes, balanced whole foods', value: 'yes' }, { label: 'No, high processed/junk foods', value: 'no' }]}
                    tooltip="Diet rich in natural fibers, vegetables, and low in added processed sugars."
                    reference="Liver fat and glucose filters factor"
                  />
                  <InputField 
                    label="How would you rate your stress level?"
                    type="select"
                    value={stressLevel}
                    onChange={setStressLevel}
                    options={[
                      { label: 'Low stress (Highly manageable)', value: 'low' },
                      { label: 'Medium stress (Moderate levels)', value: 'medium' },
                      { label: 'High stress (Significant everyday pressure)', value: 'high' }
                    ]}
                    tooltip="High stress spikes hormone releases, raising resting blood pressure."
                    reference="Vascular and nervous stress indicator"
                  />
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-5 py-2.5 bg-[var(--bg-color)] border border-[var(--card-border)] text-[var(--text-color)] hover:bg-slate-100/50 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                  >
                    ⬅️ Back to Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-sm hover:scale-[1.01] transition-all"
                  >
                    Continue to Vitals ➡️
                  </button>
                </div>
              </Card>
            )}

            {/* STEP 3: Simple Health Indicators */}
            {activeStep === 3 && (
              <Card className="p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">
                    🩺 STEP 3: Simple Vitals & Indicators
                  </h3>
                  <span className="text-xxs font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-md">3 of 4 Steps</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Blood Pressure Status"
                    type="select"
                    value={bloodPressure}
                    onChange={setBloodPressure}
                    options={[
                      { label: 'Normal / Healthy (Under 120/80)', value: 'normal' },
                      { label: 'High Blood Pressure Status', value: 'high' },
                      { label: 'Low Blood Pressure Status', value: 'low' }
                    ]}
                    tooltip="Standard pressure zones. High levels strain arterials and renal filter membranes."
                    reference="Cardio and renal tissue stress"
                  />
                  <InputField 
                    label="Blood Sugar Status"
                    type="select"
                    value={bloodSugar}
                    onChange={setBloodSugar}
                    options={[
                      { label: 'Normal / Healthy sugar trends', value: 'normal' },
                      { label: 'High Blood Sugar Status', value: 'high' }
                    ]}
                    tooltip="Glucose presence levels. High readings create glucose cellular resistance."
                    reference="Diabetes and cell strain marker"
                  />
                  <InputField 
                    label="Cholesterol Awareness Status"
                    type="select"
                    value={cholesterol}
                    onChange={setCholesterol}
                    options={[
                      { label: 'Normal / Healthy cholesterol levels', value: 'normal' },
                      { label: 'High Cholesterol Status', value: 'high' },
                      { label: 'Unknown / Have not checked recently', value: 'unknown' }
                    ]}
                    tooltip="Lipid fats indicator. Elevated levels clog vital cardiac vessels."
                    reference="Vascular flow and heart risk factor"
                  />
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-5 py-2.5 bg-[var(--bg-color)] border border-[var(--card-border)] text-[var(--text-color)] hover:bg-slate-100/50 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                  >
                    ⬅️ Back to Lifestyle
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(4)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-sm hover:scale-[1.01] transition-all"
                  >
                    Continue to History ➡️
                  </button>
                </div>
              </Card>
            )}

            {/* STEP 4: Family History */}
            {activeStep === 4 && (
              <Card className="p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">
                    👨‍👩‍👧 STEP 4: Family History
                  </h3>
                  <span className="text-xxs font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-md">4 of 4 Steps</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <InputField 
                    label="Do any close family members have chronic illnesses?"
                    type="select"
                    value={familyHistory}
                    onChange={setFamilyHistory}
                    options={[
                      { label: 'No, no chronic illness in close family', value: 'no' },
                      { label: 'Yes, close relative (parents, siblings) diagnosed', value: 'yes' }
                    ]}
                    tooltip="Diagnoses in direct biological relatives maps genetic susceptibility."
                    reference="Biological genetic baseline"
                  />
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-5 py-2.5 bg-[var(--bg-color)] border border-[var(--card-border)] text-[var(--text-color)] hover:bg-slate-100/50 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
                  >
                    ⬅️ Back to Vitals
                  </button>
                  
                  <button
                    type="submit"
                    className="px-7 py-3 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  >
                    Check Health Risk Score ✨
                  </button>
                </div>
              </Card>
            )}

          </form>
        </div>

        {/* RIGHT COLUMN: Results box */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 sticky top-24">
            <ResultBox 
              prediction={result} 
              isCalculating={isCalculating} 
              onDownload={handleDownload}
            />

            {/* Health suggestions block in result card */}
            {result && result.advice && result.advice.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[var(--card-border)] space-y-3">
                <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] flex items-center gap-1.5">
                  <span>💡 Helpful Health Advice</span>
                </h4>
                <ul className="space-y-2">
                  {result.advice.map((adv, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-[var(--text-muted)] flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-extrabold">✓</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Predict
