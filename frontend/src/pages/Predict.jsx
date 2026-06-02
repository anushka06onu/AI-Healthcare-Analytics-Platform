import React, { useState } from 'react'
import DiseaseSelector from '../components/DiseaseSelector'
import InputField from '../components/InputField'
import ResultBox from '../components/ResultBox'
import Card from '../components/Card'

function Predict({ predictions, setPredictions, setPage }) {
  const [selectedDisease, setSelectedDisease] = useState('diabetes')
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState(null)

  // 👤 Form Input States - Purged of EMR IDs & set to blank/normal defaults
  const [patientName, setPatientName] = useState('')
  
  // Coordinated healthy-by-default baselines (lowers startup risk to Low Risk)
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState('female')
  
  // Shared vitals
  const [systolicBp, setSystolicBp] = useState(115) // Normal Systolic
  const [diastolicBp, setDiastolicBp] = useState(75) // Normal Diastolic
  const [bodyWeight, setBodyWeight] = useState(22) // Normal BMI (18.5 - 24.9)
  const [bloodSugar, setBloodSugar] = useState(90) // Normal sugar (< 100)

  // Diabetes specific
  const [pregnancies, setPregnancies] = useState(0)
  const [skinFat, setSkinFat] = useState(20)
  const [insulin, setInsulin] = useState(80)
  const [pedigree, setPedigree] = useState(0.35)

  // Heart specific
  const [chestPain, setChestPain] = useState('asymptomatic') // No Pain by default
  const [cholesterol, setCholesterol] = useState(180) // Normal chol (< 200)
  const [pulse, setPulse] = useState(72) // Normal heart rate
  const [heartStrain, setHeartStrain] = useState(0.0) // No Strain by default
  const [waveSlope, setWaveSlope] = useState('normal')
  const [blockedVessels, setBlockedVessels] = useState(0)
  const [bloodFlow, setBloodFlow] = useState('normal')

  // Liver specific
  const [totalBilirubin, setTotalBilirubin] = useState(0.8) // Normal bilirubin
  const [directBilirubin, setDirectBilirubin] = useState(0.2)
  const [alpEnzyme, setAlpEnzyme] = useState(80) // Normal ALP (44 - 147)
  const [altEnzyme, setAltEnzyme] = useState(25) // Normal ALT (7 - 56)
  const [astEnzyme, setAstEnzyme] = useState(20) // Normal AST (10 - 40)
  const [proteins, setProteins] = useState(7.0) // Normal Proteins
  const [albumin, setAlbumin] = useState(4.2) // Normal Albumin
  const [agRatio, setAgRatio] = useState(1.2) // Normal A/G Ratio

  // Stroke specific
  const [highBpHistory, setHighBpHistory] = useState('no')
  const [heartTroubleHistory, setHeartTroubleHistory] = useState('no')
  const [married, setMarried] = useState('yes')
  const [occupation, setOccupation] = useState('private')
  const [locationType, setLocationType] = useState('urban')
  const [smokingHistory, setSmokingHistory] = useState('never')

  // Kidney specific
  const [urineDensity, setUrineDensity] = useState('1.020') // Healthy sg
  const [urineProteinLeak, setUrineProteinLeak] = useState('0') // Healthy al
  const [urineSugarLeak, setUrineSugarLeak] = useState('0') // Healthy su
  const [urineRbc, setUrineRbc] = useState('normal')
  const [urinePus, setUrinePus] = useState('normal')
  const [bloodUrea, setBloodUrea] = useState(15) // Healthy Blood Urea (7 - 20)
  const [creatinineWaste, setCreatinineWaste] = useState(0.8) // Healthy Creatinine (0.6 - 1.2)
  const [bloodSodium, setBloodSodium] = useState(140) // Healthy Sodium
  const [bloodPotassium, setBloodPotassium] = useState(4.0) // Healthy Potassium
  const [bloodHemoglobin, setBloodHemoglobin] = useState(14.0) // Healthy Hemoglobin
  const [hematocritPcv, setHematocritPcv] = useState(42) // Healthy PCV
  const [wbcCount, setWbcCount] = useState(7000)
  const [rbcCount, setRbcCount] = useState(4.8)
  const [appetite, setAppetite] = useState('good')
  const [legSwelling, setLegSwelling] = useState('no')
  const [anemiaHistory, setAnemiaHistory] = useState('no')

  // Core risk calculator
  const handleCalculate = (e) => {
    e.preventDefault()
    setIsCalculating(true)

    setTimeout(() => {
      let riskScore = 0
      let reasons = []

      // Diabetes Assessment Mappings
      if (selectedDisease === 'diabetes') {
        if (bloodSugar > 125) {
          riskScore += 45
          reasons.push("Your Fasting Blood Sugar is high (above 125 mg/dL), which is a key diabetes marker.")
        } else if (bloodSugar > 100) {
          riskScore += 20
          reasons.push("Your Fasting Blood Sugar level is slightly elevated, suggesting prediabetes risks.")
        }
        if (bodyWeight >= 30) {
          riskScore += 25
          reasons.push("Your Body Weight (BMI) is in the obese range, increasing insulin stress.")
        } else if (bodyWeight >= 25) {
          riskScore += 12
          reasons.push("Your Body Weight is slightly above the standard healthy BMI zone.")
        }
        if (age > 45) {
          riskScore += 15
          reasons.push("Being over 45 naturally increases metabolic risk parameters.")
        }
        if (insulin > 150) {
          riskScore += 10
          reasons.push("Elevated 2-Hour insulin readings suggest your body cells resist insulin.")
        }
      } 
      
      // Heart Disease Assessment Mappings
      else if (selectedDisease === 'heart') {
        if (systolicBp >= 140 || diastolicBp >= 90) {
          riskScore += 30
          reasons.push("Your resting blood pressure is high, creating constant vascular wall strain.")
        } else if (systolicBp >= 130 || diastolicBp >= 80) {
          riskScore += 15
          reasons.push("Your resting blood pressure is slightly elevated.")
        }
        if (cholesterol > 240) {
          riskScore += 25
          reasons.push("Your blood cholesterol level is high, accelerating arterial clogging risks.")
        }
        if (blockedVessels > 0) {
          riskScore += 25
          reasons.push(`Heart scans identify ${blockedVessels} main coronary arteries blocked.`);
        }
        if (heartStrain > 1.5) {
          riskScore += 15
          reasons.push("ECG tracking flags moderate heart strain during active workouts.")
        }
        if (age > 50) {
          riskScore += 10
          reasons.push("Blood vessels naturally stiffen slightly as you age.")
        }
      } 
      
      // Liver Disease Assessment Mappings
      else if (selectedDisease === 'liver') {
        if (totalBilirubin > 1.2) {
          riskScore += 35
          reasons.push("Your bile waste (Bilirubin) is elevated, suggesting biliary duct or cell strain.")
        }
        if (altEnzyme > 56) {
          riskScore += 30
          reasons.push("Your ALT Liver Irritation Enzyme is high, pointing to liver cell stress.")
        }
        if (albumin < 3.5) {
          riskScore += 20
          reasons.push("Your Albumin protein synthesis is below standard, indicating hepatic fatigue.")
        }
        if (agRatio < 0.8) {
          riskScore += 15
          reasons.push("Your Albumin/Globulin ratio is low, mapping chronic hepatic strain.")
        }
      } 
      
      // Stroke Assessment Mappings
      else if (selectedDisease === 'stroke') {
        if (highBpHistory === 'yes' || systolicBp >= 140) {
          riskScore += 35
          reasons.push("A history of high blood pressure is the leading risk factor for cerebral circulation.")
        }
        if (bloodSugar > 140) {
          riskScore += 25
          reasons.push("Elevated sugar levels irritate cerebral blood vessel wall linings.")
        }
        if (heartTroubleHistory === 'yes') {
          riskScore += 20
          reasons.push("Previous heart trouble histories increase the likelihood of microscopic clot formation.")
        }
        if (smokingHistory === 'smokes') {
          riskScore += 15
          reasons.push("Active smoking narrows blood vessels and increases plaque rupture risks.")
        }
        if (age > 60) {
          riskScore += 10
          reasons.push("Brain arteries naturally weaken and lose flexibility over 60.")
        }
      } 
      
      // Kidney Disease Assessment Mappings
      else if (selectedDisease === 'kidney') {
        if (creatinineWaste > 1.2) {
          riskScore += 45
          reasons.push("Your Kidney Creatinine Waste is high, indicating a drop in kidney filtration.")
        }
        if (urineProteinLeak !== '0') {
          riskScore += 25
          reasons.push("Urine tests show proteins are leaking through your kidney filtration walls.")
        }
        if (urineDensity === '1.005' || urineDensity === '1.010') {
          riskScore += 15
          reasons.push("Urine Specific Gravity is low, indicating kidneys are struggling to concentrate waste.")
        }
        if (bloodHemoglobin < 12.0) {
          riskScore += 15
          reasons.push("Low hemoglobin (Anemia) is a standard indicator of chronic renal filtration strain.")
        }
        if (highBpHistory === 'yes' || diastolicBp >= 90) {
          riskScore += 10
          reasons.push("Chronic blood pressure elevations speed up microscopic kidney vascular damages.")
        }
      }

      // Bound risk score
      riskScore = Math.min(Math.max(riskScore, 6), 98)
      
      let riskLevel = "Low"
      if (riskScore >= 70) riskLevel = "High"
      else if (riskScore >= 35) riskLevel = "Medium"

      const d_titles = { diabetes: 'Diabetes', heart: 'Heart Disease', liver: 'Liver Disease', stroke: 'Stroke', kidney: 'Kidney Disease' }
      const newPrediction = {
        id: predictions.length + 1,
        date: new Date().toISOString().split('T')[0],
        disease: d_titles[selectedDisease],
        riskScore,
        riskLevel,
        reasons,
        patientName: patientName.trim() || 'Guest User',
        patientId: 'GUEST-' + Math.floor(1000 + Math.random() * 9000)
      }

      setResult(newPrediction)
      setPredictions([newPrediction, ...predictions])
      setIsCalculating(false)
    }, 1000)
  }

  // Simulated EMR report compiler PDF download
  const handleDownload = () => {
    if (!result) return
    
    alert(`💾 Clinical PDF Compile Success!\n\n` +
          `File: health_risk_report_${result.patientId}.pdf\n` +
          `User: ${result.patientName}\n` +
          `Assessor: HealthAI Assistant\n` +
          `Diagnostic: ${result.disease} (${result.riskLevel} Risk - ${result.riskScore}%)\n\n` +
          `Saving your personalized risk report...`)
  }

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Visual Diagnostic Focus selector */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-color)] mb-2">
              🔬 Health Risk Checker
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              Select the diagnostic focus from the dropdown. Enter your basic health parameters in the panels below. All inputs use plain, jargon-free terminology with normal ranges.
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Form */}
        <form onSubmit={handleCalculate} className="lg:col-span-7 space-y-6">
          {/* Section 1: About You Profile */}
          <Card className="p-6">
            <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
              👤 About You
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Your Name (Optional)"
                type="text"
                value={patientName}
                onChange={setPatientName}
                reference="Used solely to personalize your PDF report"
              />
              <InputField 
                label="Your Age"
                type="slider"
                min={1}
                max={110}
                value={age}
                onChange={setAge}
                reference="Age in years"
              />
              <InputField 
                label="Biological Sex"
                type="select"
                value={sex}
                onChange={setSex}
                options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]}
                reference="Used for metabolic baselines"
              />
            </div>
          </Card>

          {/* Section 2: Shared Vitals */}
          <Card className="p-6">
            <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
              🩺 Body vital indicators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Fasting Blood Sugar level"
                type="slider"
                min={50}
                max={250}
                value={bloodSugar}
                onChange={setBloodSugar}
                tooltip="Your fasting sugar level. Elevated sugar points to prediabetes/diabetes conditions."
                reference="Healthy standard: Under 100 mg/dL"
              />
              <InputField 
                label="Body Weight level (BMI)"
                type="slider"
                min={10}
                max={50}
                value={bodyWeight}
                onChange={setBodyWeight}
                tooltip="Body weight ratio based on height and weight. High weight increases vascular strain."
                reference="Healthy standard: 18.5 - 24.9"
              />
              <InputField 
                label="Resting Upper Blood Pressure"
                type="slider"
                min={80}
                max={200}
                value={systolicBp}
                onChange={setSystolicBp}
                tooltip="Arterial wall pressure when heart beats. High upper BP is high cardiovascular strain."
                reference="Healthy standard: Under 120 mm Hg"
              />
              <InputField 
                label="Resting Lower Blood Pressure"
                type="slider"
                min={50}
                max={120}
                value={diastolicBp}
                onChange={setDiastolicBp}
                tooltip="Arterial wall pressure when heart rests. High lower BP is general vascular strain."
                reference="Healthy standard: Under 80 mm Hg"
              />
            </div>
          </Card>

          {/* Section 3: Conditional Lab parameters based on selected disease */}
          {selectedDisease === 'diabetes' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
                🧪 Sugar & Diabetes Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sex === 'female' && (
                  <InputField 
                    label="Number of Past Pregnancies"
                    type="slider"
                    min={0}
                    max={15}
                    value={pregnancies}
                    onChange={setPregnancies}
                    reference="Female pregnancy history tracking"
                  />
                )}
                <InputField 
                  label="Triceps Skin Fold Thickness (Arm Fat)"
                  type="slider"
                  min={1}
                  max={80}
                  value={skinFat}
                  onChange={setSkinFat}
                  tooltip="Arm skin fold thickness used to estimate overall body fat reserves."
                  reference="Typical standard: 10 - 50 mm"
                />
                <InputField 
                  label="2-Hour Blood Insulin level"
                  type="slider"
                  min={10}
                  max={600}
                  value={insulin}
                  onChange={setInsulin}
                  tooltip="Insulin response level. High insulin levels map cellular glucose resistance."
                  reference="Typical standard: 15 - 276 mu U/ml"
                />
                <InputField 
                  label="Family History Diabetes Score"
                  type="slider"
                  min={0.05}
                  max={2.5}
                  step={0.01}
                  value={pedigree}
                  onChange={setPedigree}
                  tooltip="Genetic risk scoring mapping diabetes occurrences in direct blood relatives."
                  reference="Typical standard: 0.08 - 2.40"
                />
              </div>
            </Card>
          )}

          {selectedDisease === 'heart' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
                🧪 Heart Activity Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="Total Blood Cholesterol level"
                  type="slider"
                  min={100}
                  max={500}
                  value={cholesterol}
                  onChange={setCholesterol}
                  tooltip="Fatty lipids counts. Elevated total cholesterol increases cardiovascular strain."
                  reference="Healthy target: Under 200 mg/dL"
                />
                <InputField 
                  label="Maximum Heart Rate Achieved (Pulse)"
                  type="slider"
                  min={60}
                  max={230}
                  value={pulse}
                  onChange={setPulse}
                  tooltip="Maximum recorded pulse rate during cardio exercise."
                  reference="Target fitness heart rate"
                />
                <InputField 
                  label="Heart Strain level (ST depression)"
                  type="slider"
                  min={0.0}
                  max={8.0}
                  step={0.1}
                  value={heartStrain}
                  onChange={setHeartStrain}
                  tooltip="ECG wave ST strain depressions. High suggests vascular oxygen deficits."
                  reference="Healthy target: Under 1.0"
                />
                <InputField 
                  label="Blocked Major Coronary Vessels Count"
                  type="slider"
                  min={0}
                  max={4}
                  value={blockedVessels}
                  onChange={setBlockedVessels}
                  tooltip="Main heart blood vessels found blocked under diagnostic fluoroscopy."
                  reference="Healthy target: 0 vessels blocked"
                />
                <InputField 
                  label="Chest Pain Severity Type"
                  type="select"
                  value={chestPain}
                  onChange={setChestPain}
                  options={[
                    { label: 'No Chest Pain (Asymptomatic)', value: 'asymptomatic' },
                    { label: 'Non-Anginal Muscle Pain', value: 'nonanginal' },
                    { label: 'Typical Heart Angina', value: 'typical' },
                    { label: 'Atypical Non-Classic Pain', value: 'atypical' }
                  ]}
                  reference="Clinical severity pain mapping"
                />
                <InputField 
                  label="Resting Electrocardiogram (ECG)"
                  type="select"
                  value={waveSlope}
                  onChange={setWaveSlope}
                  options={[
                    { label: 'Normal / Healthy ECG Response', value: 'normal' },
                    { label: 'ST-T Wave Abnormality (Heart Strain)', value: 'abnormality' },
                    { label: 'Left Ventricular Hypertrophy (Enlargement)', value: 'hypertrophy' }
                  ]}
                  reference="Cardio wall thickness ECG indicators"
                />
                <InputField 
                  label="Heart Blood Flow Scan (Thalassemia)"
                  type="select"
                  value={bloodFlow}
                  onChange={setBloodFlow}
                  options={[
                    { label: 'Normal Blood Flow Scan', value: 'normal' },
                    { label: 'Fixed flow defect (Old muscle damage)', value: 'fixed' },
                    { label: 'Reversible defect (Active blockage risk)', value: 'reversible' }
                  ]}
                  reference="Vascular flow perfusion indicators"
                />
              </div>
            </Card>
          )}

          {selectedDisease === 'liver' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
                🧪 Liver Enzymes & Protein Panel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="Bile Waste Pigment (Total Bilirubin)"
                  type="slider"
                  min={0.1}
                  max={10.0}
                  step={0.1}
                  value={totalBilirubin}
                  onChange={setTotalBilirubin}
                  tooltip="Yellow bile pigment. Elevated levels suggest structural liver blockages."
                  reference="Healthy total: 0.1 - 1.2 mg/dL"
                />
                <InputField 
                  label="Direct Bilirubin (Processed Bile Pigment)"
                  type="slider"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={directBilirubin}
                  onChange={setDirectBilirubin}
                  tooltip="Processed bile waste. High levels indicate cellular liver injury."
                  reference="Healthy direct: 0.0 - 0.3 mg/dL"
                />
                <InputField 
                  label="Liver Alkaline Enzyme (ALP)"
                  type="slider"
                  min={20}
                  max={500}
                  value={alpEnzyme}
                  onChange={setAlpEnzyme}
                  tooltip="Liver and bone enzyme. High values indicate bile duct congestion."
                  reference="Healthy ALP: 44 - 147 IU/L"
                />
                <InputField 
                  label="ALT Liver Cell Irritation Enzyme"
                  type="slider"
                  min={5}
                  max={300}
                  value={altEnzyme}
                  onChange={setAltEnzyme}
                  tooltip="Released directly into blood when liver cells are irritated or stressed."
                  reference="Healthy ALT: 7 - 56 IU/L"
                />
                <InputField 
                  label="AST Tissue Activity Enzyme"
                  type="slider"
                  min={5}
                  max={300}
                  value={astEnzyme}
                  onChange={setAstEnzyme}
                  tooltip="Enzyme released during structural tissue or muscle damage."
                  reference="Healthy AST: 10 - 40 IU/L"
                />
                <InputField 
                  label="Total Blood Proteins"
                  type="slider"
                  min={3.0}
                  max={10.0}
                  step={0.1}
                  value={proteins}
                  onChange={setProteins}
                  tooltip="Combined count of blood globulin and albumin proteins."
                  reference="Healthy Proteins: 6.0 - 8.3 g/dL"
                />
                <InputField 
                  label="Albumin Protein level"
                  type="slider"
                  min={1.0}
                  max={6.0}
                  step={0.1}
                  value={albumin}
                  onChange={setAlbumin}
                  tooltip="Primary transport blood protein created exclusively by hepatocytes."
                  reference="Healthy Albumin: 3.5 - 5.0 g/dl"
                />
                <InputField 
                  label="Albumin and Globulin Protein Ratio"
                  type="slider"
                  min={0.2}
                  max={2.5}
                  step={0.01}
                  value={agRatio}
                  onChange={setAgRatio}
                  tooltip="A/G ratio. Low ratios suggests chronic cellular dysfunction."
                  reference="Healthy Ratio: 0.8 - 2.0"
                />
              </div>
            </Card>
          )}

          {selectedDisease === 'stroke' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
                🏥 Medical History & Lifestyle Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="High Blood Pressure History?"
                  type="select"
                  value={highBpHistory}
                  onChange={setHighBpHistory}
                  options={[{ label: 'No History', value: 'no' }, { label: 'Yes (Active history)', value: 'yes' }]}
                  reference="Has chronic high blood pressure been diagnosed?"
                />
                <InputField 
                  label="Heart Trouble History?"
                  type="select"
                  value={heartTroubleHistory}
                  onChange={setHeartTroubleHistory}
                  options={[{ label: 'No History', value: 'no' }, { label: 'Yes (Active history)', value: 'yes' }]}
                  reference="Heart failure or vessel blockages history?"
                />
                <InputField 
                  label="Smoking History Status"
                  type="select"
                  value={smokingHistory}
                  onChange={setSmokingHistory}
                  options={[
                    { label: 'Never Smoked', value: 'never' },
                    { label: 'Formerly Smoked (Quit)', value: 'quit' },
                    { label: 'Active Smoker', value: 'smokes' },
                    { label: 'Unknown / Not Disclosed', value: 'unknown' }
                  ]}
                  reference="Vascular narrows and plaque risks"
                />
                <InputField 
                  label="Ever Married?"
                  type="select"
                  value={married}
                  onChange={setMarried}
                  options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
                  reference="Demographic marker"
                />
                <InputField 
                  label="Primary Occupation / Work Type"
                  type="select"
                  value={occupation}
                  onChange={setOccupation}
                  options={[
                    { label: 'Private Corporate Sector', value: 'private' },
                    { label: 'Government Employee', value: 'gov' },
                    { label: 'Self-employed', value: 'self' },
                    { label: 'Student / Child', value: 'student' },
                    { label: 'Never Worked', value: 'none' }
                  ]}
                  reference="Work strain occupational tracking"
                />
                <InputField 
                  label="Residence Location Type"
                  type="select"
                  value={locationType}
                  onChange={setLocationType}
                  options={[{ label: 'Urban / City', value: 'urban' }, { label: 'Rural / Countryside', value: 'rural' }]}
                  reference="Environment variables"
                />
              </div>
            </Card>
          )}

          {selectedDisease === 'kidney' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-color)] uppercase tracking-wider mb-4 border-b border-[var(--card-border)] pb-2">
                🧪 Urine & Kidney Filtration Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="Urine specific gravity (Density)"
                  type="select"
                  value={urineDensity}
                  onChange={setUrineDensity}
                  options={[
                    { label: '1.020 (Healthy concentration)', value: '1.020' },
                    { label: '1.025 (Healthy concentration)', value: '1.025' },
                    { label: '1.015 (Mild dilution)', value: '1.015' },
                    { label: '1.010 (Dilute / filter struggle)', value: '1.010' },
                    { label: '1.005 (Severe filter struggle)', value: '1.005' }
                  ]}
                  reference="Specific gravity renal concentration"
                />
                <InputField 
                  label="Urine Protein level (Albumin Leakage)"
                  type="select"
                  value={urineProteinLeak}
                  onChange={setUrineProteinLeak}
                  options={[
                    { label: '0 (Normal/No leakage)', value: '0' },
                    { label: '1 (Trace leakage)', value: '1' },
                    { label: '2 (Moderate leakage)', value: '2' },
                    { label: '3 (High leakage)', value: '3' },
                    { label: '4 (Severe leakage)', value: '4' }
                  ]}
                  reference="Albumin protein leaking in urine"
                />
                <InputField 
                  label="Urine Sugar level (Glucose Leakage)"
                  type="select"
                  value={urineSugarLeak}
                  onChange={setUrineSugarLeak}
                  options={[
                    { label: '0 (Normal/No leakage)', value: '0' },
                    { label: '1 (Trace leakage)', value: '1' },
                    { label: '2 (Moderate leakage)', value: '2' },
                    { label: '3 (High leakage)', value: '3' },
                    { label: '4 (Severe leakage)', value: '4' }
                  ]}
                  reference="Glucose sugar leaking in urine"
                />
                <InputField 
                  label="Urine Red Blood Cells Status"
                  type="select"
                  value={urineRbc}
                  onChange={setUrineRbc}
                  options={[{ label: 'Healthy / Clear (Normal)', value: 'normal' }, { label: 'Abnormal / Blood present', value: 'abnormal' }]}
                  reference="Microscopic blood in urine"
                />
                <InputField 
                  label="Urine Pus Cells Status (White Cells)"
                  type="select"
                  value={urinePus}
                  onChange={setUrinePus}
                  options={[{ label: 'Healthy / Clear (Normal)', value: 'normal' }, { label: 'Abnormal / Infection signs', value: 'abnormal' }]}
                  reference="Active micro renal infections"
                />
                <InputField 
                  label="Kidney Nitrogen Waste level (Blood Urea)"
                  type="slider"
                  min={5}
                  max={200}
                  value={bloodUrea}
                  onChange={setBloodUrea}
                  tooltip="Nitrogen waste filtered by kidneys. High levels suggest a drop in filtration rate."
                  reference="Healthy range: 7 - 20 mg/dL"
                />
                <InputField 
                  label="Kidney Filtration Waste level (Creatinine)"
                  type="slider"
                  min={0.1}
                  max={15.0}
                  step={0.1}
                  value={creatinineWaste}
                  onChange={setCreatinineWaste}
                  tooltip="Creatinine muscle wear waste. Highly sensitive marker for kidney filtering decline."
                  reference="Healthy range: 0.6 - 1.2 mg/dL"
                />
                <InputField 
                  label="Blood Hemoglobin level"
                  type="slider"
                  min={5.0}
                  max={20.0}
                  step={0.1}
                  value={bloodHemoglobin}
                  onChange={setBloodHemoglobin}
                  tooltip="Oxygen carrying hemoglobin. Low values indicate anemia, standard in renal strain."
                  reference="Healthy total: 12.0 - 17.5 g/dl"
                />
                <InputField 
                  label="Red Blood Cell Percentage (Hematocrit PCV)"
                  type="slider"
                  min={10}
                  max={60}
                  value={hematocritPcv}
                  onChange={setHematocritPcv}
                  tooltip="PCV hematocrit blood percentage. Low indicates anemia."
                  reference="Healthy range: 36% - 50%"
                />
                <InputField 
                  label="Blood Potassium level"
                  type="slider"
                  min={2.0}
                  max={15.0}
                  step={0.1}
                  value={bloodPotassium}
                  onChange={setBloodPotassium}
                  tooltip="Vital cardiac rhythm electrolyte. High counts require dynamic management."
                  reference="Healthy range: 3.5 - 5.0 mEq/L"
                />
              </div>
            </Card>
          )}

          {/* Action Submission Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 w-full sm:w-auto cursor-pointer"
            >
              Check Health Risk Score
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Results panel */}
        <div className="lg:col-span-5">
          <Card className="p-6 sticky top-24">
            <ResultBox 
              prediction={result} 
              isCalculating={isCalculating} 
              onDownload={handleDownload}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Predict
