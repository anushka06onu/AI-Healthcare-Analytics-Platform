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
      if (age > 45 && age <= 65) {
        riskScore += 10
        reasons.push(`Your current age of ${age} years puts you in a stage of life where metabolic baselines naturally begin to slow down slightly, making standard body systems a bit more sensitive to lifestyle stress factors over time.`)
      } else if (age > 65) {
        riskScore += 22
        reasons.push(`Being ${age} years of age means your body has accumulated years of biological experience. Naturally, cellular repair mechanisms and blood vessels tend to become less elastic over the years, which increases baseline risk indices.`)
      }

      // Lifestyle risk factors across all diseases
      if (smoke === 'yes') {
        if (selectedDisease === 'heart' || selectedDisease === 'stroke') {
          riskScore += 28
          reasons.push("Active tobacco smoking introduces carbon monoxide and chemical free radicals that narrow and stiffen your blood vessels. This restricts vital oxygen delivery and substantially speeds up the natural formation of cardiovascular plaques.")
        } else {
          riskScore += 12
          reasons.push("Tobacco smoke exposes your cells to external oxidative stress, which forces your internal organs, blood filters, and cellular pathways to work harder to neutralize free radicals.")
        }
        advice.push("Consider speaking with a health coach or joining a smoking cessation support program to protect your delicate blood vessels.")
      }

      if (exercise === 'no') {
        riskScore += 15
        reasons.push("Having a sedentary lifestyle means your heart muscle is not receiving regular aerobic conditioning, and your cellular metabolism is slower. Regular physical movement acts like a natural vacuum, helping clear excess glucose and cholesterol from your blood.")
        advice.push("Aim for 150 minutes of moderate activity weekly—even starting with simple, brisk 15-minute daily walks can activate vascular protection.")
      } else {
        advice.push("Great job! Maintain your active physical exercise routine.")
      }

      if (balancedDiet === 'no') {
        if (selectedDisease === 'liver' || selectedDisease === 'diabetes') {
          riskScore += 22
          reasons.push("An unbalanced diet high in ultra-processed sugars and fats causes sudden glucose spikes and forces your body to store excess energy. This directly strains your pancreas's insulin locks and places an extra metabolic burden on your liver filters.")
        } else {
          riskScore += 10
          reasons.push("Eating processed foods frequently deprives your body of protective antioxidants and vital plant fibers that naturally buffer blood pressure and sweep cholesterol out of your bloodstream.")
        }
        advice.push("Focus on fiber-rich whole foods, leafy green vegetables, and natural ingredients while reducing packaged/processed meals.")
      }

      if (stressLevel === 'high') {
        riskScore += 18
        reasons.push("Experiencing high everyday stress triggers a sustained 'fight-or-flight' hormonal response. The constant release of cortisol and adrenaline narrows blood vessels and prompts your liver to release extra sugars into circulation.")
        advice.push("Incorporate 5 to 10 minutes of daily mindfulness, deep-breathing exercises, or light yoga to quiet your nervous system and lower blood stress.")
      } else if (stressLevel === 'medium') {
        riskScore += 6
      }

      // Family History risk factor across all diseases
      if (familyHistory === 'yes') {
        riskScore += 16
        reasons.push("Having close biological relatives (parents or siblings) diagnosed with chronic illness points to a minor genetic predisposition. While genes are not destiny, it means your metabolic cellular pathways are naturally more sensitive to environmental and lifestyle habits.")
      }

      // Internal Mapping Logic based on selected disease
      if (selectedDisease === 'diabetes') {
        if (bloodSugar === 'high') {
          riskScore += 45
          reasons.push("Your blood sugar trend is currently high, which is the primary indicator of cellular insulin resistance. This means glucose remains circulating in your bloodstream rather than entering cells for energy, placing high direct strain on your pancreatic health.")
        }
        if (bmi >= 30) {
          riskScore += 20
          reasons.push(`Your calculated Body Mass Index (BMI: ${bmi}) is in the obese zone. This excess weight accumulates fat cells around vital organs, creating a strong physical barrier that blocks insulin receptors from absorbing blood sugar, leading to severe insulin resistance.`)
        } else if (bmi >= 25) {
          riskScore += 10
          reasons.push(`Your calculated Body Mass Index (BMI: ${bmi}) is in the overweight range. Even minor excess body weight can create partial resistance in your cellular insulin locks, making it harder for your body to process dietary sugars efficiently.`)
        }
        if (bloodPressure === 'high') {
          riskScore += 12
          reasons.push("Elevated blood pressure is strongly linked to overall insulin resistance, as narrowed vessels limit the speed at which insulin can circulate and clear sugars from your tissues.")
        }
      } 
      
      else if (selectedDisease === 'heart') {
        if (bloodPressure === 'high') {
          riskScore += 35
          reasons.push("High blood pressure puts constant, heavy physical stress on your arterial walls. This continuous physical pressure damages the delicate inner linings of your arteries, making it much easier for fats and plaque to accumulate.")
        }
        if (cholesterol === 'high') {
          riskScore += 25
          reasons.push("Elevated cholesterol levels mean there is an excess of circulating lipid fats in your bloodstream. Over time, these fats can bind with other substances to build physical plaque barriers inside your coronary arteries, restricting natural oxygenated blood flow.")
        }
        if (bloodSugar === 'high') {
          riskScore += 12
          reasons.push("High sugar levels irritate arterial walls, speeding up clogging risks.")
        }
      } 
      
      else if (selectedDisease === 'liver') {
        if (cholesterol === 'high') {
          riskScore += 22
          reasons.push("Elevated blood lipid levels force the liver to filter and process excessive fat particles, which can lead to fat droplets accumulating inside hepatic cells and causing cellular swelling.")
        }
        if (bloodSugar === 'high') {
          riskScore += 15
          reasons.push("High circulating blood sugars prompt the liver to convert excess glucose directly into saturated fats, which are then stored within the liver tissue itself, raising risk indexes.")
        }
        if (bmi >= 30) {
          riskScore += 15
          reasons.push("A higher weight index (BMI in the obese range) is strongly associated with direct fat accumulation in liver tissues, leading to non-alcoholic cellular irritation.")
        }
      } 
      
      else if (selectedDisease === 'stroke') {
        if (bloodPressure === 'high') {
          riskScore += 40
          reasons.push("High blood pressure is the single most critical driver of stroke risk. It places excessive structural stress on the delicate arteries supplying your brain, making them prone to weakening or clotting.")
        }
        if (cholesterol === 'high') {
          riskScore += 15
          reasons.push("Elevated cholesterol levels speed up the buildup of plaque in the carotid arteries of your neck, which are the main pathways delivering fresh oxygenated blood directly to your brain.")
        }
        if (bloodSugar === 'high') {
          riskScore += 10
          reasons.push("Excess blood sugars chemically irritate and weaken the small, sensitive blood vessels in the brain, making them more vulnerable to cellular damage.")
        }
      } 
      
      else if (selectedDisease === 'kidney') {
        if (bloodPressure === 'high') {
          riskScore += 35
          reasons.push("High blood pressure damages the microscopic, highly sensitive filtering pathways (nephrons) in your kidneys. Once these delicate filters are scarred by heavy blood pressure, they lose their ability to filter bodily wastes.")
        }
        if (bloodSugar === 'high') {
          riskScore += 30
          reasons.push("Consistent high blood sugar damages the small blood vessels inside your kidneys. This forces the kidney filters to work in overdrive to process blood, eventually wearing out the delicate tissue.")
        }
        if (bmi >= 30) {
          riskScore += 10
          reasons.push("Elevated weight indices increase your body's overall metabolic demands, forcing your kidneys to hyper-filter excess fluid volumes to clear metabolic wastes.")
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
            body { font-family: 'Outfit', sans-serif; color: #0F172A; padding: 40px; margin: 0; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { display: flex; align-items: center; gap: 8px; }
            .brand-logo { background: #2563EB; color: white; padding: 6px 12px; font-weight: 900; border-radius: 8px; }
            .brand-name { font-size: 22px; font-weight: 900; }
            .brand-name span { color: #2563EB; }
            .report-meta { text-align: right; font-size: 11px; color: #64748B; }
            .report-title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 25px; }
            .card { border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; background: #F8FAFC; margin-bottom: 20px; }
            .card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 15px; }
            .vital-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; }
            .vital-value { font-weight: 800; }
            .score-card { text-align: center; border-radius: 16px; padding: 24px; border: 1px solid ${levelColors.border}; background: ${levelColors.bg}; }
            .score-badge { font-size: 32px; font-weight: 900; color: ${levelColors.text}; }
            .reason-item { font-size: 13px; margin-bottom: 10px; }
            .reason-bullet { color: #2563EB; font-weight: 800; }
            .advice-item { font-size: 13px; margin-bottom: 10px; }
            .advice-bullet { color: #10B981; font-weight: 800; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand"><div class="brand-logo">H</div><div class="brand-name">Health<span>AI</span></div></div>
            <div class="report-meta">Report ID: ${result.patientId}<br />Date: ${result.date}</div>
          </div>
          <div class="report-title">${result.disease} Risk Assessment</div>
          <div class="score-card">
            <div class="score-badge">${result.riskLevel} RISK: ${result.riskScore}%</div>
          </div>
          <div class="card">
            <div class="card-title">🔍 Why this score?</div>
            ${result.reasons.map(r => `<div class="reason-item"><span class="reason-bullet">•</span> ${r}</div>`).join('')}
          </div>
          <div class="card">
            <div class="card-title">💡 Wellness Actions</div>
            ${result.advice.map(a => `<div class="advice-item"><span class="advice-bullet">✓</span> ${a}</div>`).join('')}
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-8 py-4 sm:py-6">
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
      {result && !isCalculating ? (
        <div className="animate-fade-in w-full">
          <ResultBox 
            prediction={result} 
            isCalculating={isCalculating} 
            onDownload={handleDownload}
            onReevaluate={() => {
              setResult(null)
              setActiveStep(1)
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-2xl shadow-sm flex items-center justify-between">
              {[
                { nr: 1, label: "Profile" },
                { nr: 2, label: "Lifestyle" },
                { nr: 3, label: "Indicators" },
                { nr: 4, label: "History" }
              ].map((step) => (
                <button
                  key={step.nr}
                  type="button"
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
              {activeStep === 1 && (
                <Card className="p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">
                      👤 STEP 1: Basic Profile Info
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Your Name (Optional)" type="text" value={patientName} onChange={setPatientName} />
                    <InputField label="How old are you?" type="slider" min={1} max={110} value={age} onChange={setAge} />
                    <InputField label="Your Gender" type="select" value={sex} onChange={setSex} options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]} />
                    <InputField label="Your Height (cm)" type="slider" min={100} max={220} value={height} onChange={setHeight} />
                    <InputField label="Your Weight (kg)" type="slider" min={30} max={185} value={weight} onChange={setWeight} />
                  </div>
                  <div className="flex justify-end pt-4 mt-4 border-t border-[var(--card-border)]">
                    <button type="button" onClick={() => setActiveStep(2)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer">Continue ➡️</button>
                  </div>
                </Card>
              )}

              {activeStep === 2 && (
                <Card className="p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">🏃 STEP 2: Lifestyle Habits</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Do you smoke?" type="select" value={smoke} onChange={setSmoke} options={[{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }]} />
                    <InputField label="Regular Exercise?" type="select" value={exercise} onChange={setExercise} options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]} />
                    <InputField label="Balanced Diet?" type="select" value={balancedDiet} onChange={setBalancedDiet} options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]} />
                    <InputField label="Stress Level?" type="select" value={stressLevel} onChange={setStressLevel} options={[{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }]} />
                  </div>
                  <div className="flex justify-between pt-4 mt-4 border-t border-[var(--card-border)]">
                    <button type="button" onClick={() => setActiveStep(1)} className="px-5 py-2.5 bg-slate-100 font-bold text-xs rounded-xl">⬅️ Back</button>
                    <button type="button" onClick={() => setActiveStep(3)} className="px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl">Continue ➡️</button>
                  </div>
                </Card>
              )}

              {activeStep === 3 && (
                <Card className="p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">🩺 STEP 3: Vitals</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Blood Pressure" type="select" value={bloodPressure} onChange={setBloodPressure} options={[{ label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Low', value: 'low' }]} />
                    <InputField label="Blood Sugar" type="select" value={bloodSugar} onChange={setBloodSugar} options={[{ label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }]} />
                    <InputField label="Cholesterol" type="select" value={cholesterol} onChange={setCholesterol} options={[{ label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Unknown', value: 'unknown' }]} />
                  </div>
                  <div className="flex justify-between pt-4 mt-4 border-t border-[var(--card-border)]">
                    <button type="button" onClick={() => setActiveStep(2)} className="px-5 py-2.5 bg-slate-100 font-bold text-xs rounded-xl">⬅️ Back</button>
                    <button type="button" onClick={() => setActiveStep(4)} className="px-5 py-2.5 bg-blue-600 text-white font-extrabold text-xs rounded-xl">Continue ➡️</button>
                  </div>
                </Card>
              )}

              {activeStep === 4 && (
                <Card className="p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider">👨‍👩‍👧 STEP 4: Family History</h3>
                  </div>
                  <InputField label="Family Chronic History?" type="select" value={familyHistory} onChange={setFamilyHistory} options={[{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }]} />
                  <div className="flex justify-between pt-4 mt-4 border-t border-[var(--card-border)]">
                    <button type="button" onClick={() => setActiveStep(3)} className="px-5 py-2.5 bg-slate-100 font-bold text-xs rounded-xl">⬅️ Back</button>
                    <button type="submit" className="px-7 py-3 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md">Check Risk Score ✨</button>
                  </div>
                </Card>
              )}
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 sticky top-24">
              <ResultBox 
                prediction={result} 
                isCalculating={isCalculating} 
                onDownload={handleDownload}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default Predict
