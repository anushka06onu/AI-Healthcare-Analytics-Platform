import React, { useState } from 'react'
import DiseaseSelector from '../components/DiseaseSelector'
import InputField from '../components/InputField'
import ResultBox from '../components/ResultBox'
import Card from '../components/Card'

function Predict({ predictions, setPredictions, setPage }) {
  const [selectedDisease, setSelectedDisease] = useState('diabetes')
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState(null)

  // 👤 Form Input States - Purged of Mock Placeholders (Blank-by-default for Text fields)
  const [patientName, setPatientName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [age, setAge] = useState(45)
  const [sex, setSex] = useState('female')
  
  // Shared vitals
  const [systolicBp, setSystolicBp] = useState(120)
  const [diastolicBp, setDiastolicBp] = useState(80)
  const [bodyWeight, setBodyWeight] = useState(25) // BMI
  const [bloodSugar, setBloodSugar] = useState(100) // Fasting Glucose

  // Diabetes specific
  const [pregnancies, setPregnancies] = useState(0)
  const [skinFat, setSkinFat] = useState(23)
  const [insulin, setInsulin] = useState(30)
  const [pedigree, setPedigree] = useState(0.37)

  // Heart specific
  const [chestPain, setChestPain] = useState('typical')
  const [cholesterol, setCholesterol] = useState(240)
  const [pulse, setPulse] = useState(153)
  const [heartStrain, setHeartStrain] = useState(0.8)
  const [waveSlope, setWaveSlope] = useState('flat')
  const [blockedVessels, setBlockedVessels] = useState(0)
  const [bloodFlow, setBloodFlow] = useState('normal')

  // Liver specific
  const [totalBilirubin, setTotalBilirubin] = useState(1.0)
  const [directBilirubin, setDirectBilirubin] = useState(0.3)
  const [alpEnzyme, setAlpEnzyme] = useState(208)
  const [altEnzyme, setAltEnzyme] = useState(35)
  const [astEnzyme, setAstEnzyme] = useState(42)
  const [proteins, setProteins] = useState(6.6)
  const [albumin, setAlbumin] = useState(3.1)
  const [agRatio, setAgRatio] = useState(0.93)

  // Stroke specific
  const [highBpHistory, setHighBpHistory] = useState('no')
  const [heartTroubleHistory, setHeartTroubleHistory] = useState('no')
  const [married, setMarried] = useState('yes')
  const [occupation, setOccupation] = useState('private')
  const [locationType, setLocationType] = useState('urban')
  const [smokingHistory, setSmokingHistory] = useState('never')

  // Kidney specific
  const [urineDensity, setUrineDensity] = useState('1.020') // sg
  const [urineProteinLeak, setUrineProteinLeak] = useState('0') // al
  const [urineSugarLeak, setUrineSugarLeak] = useState('0') // su
  const [urineRbc, setUrineRbc] = useState('normal')
  const [urinePus, setUrinePus] = useState('normal')
  const [bloodUrea, setBloodUrea] = useState(36)
  const [creatinineWaste, setCreatinineWaste] = useState(1.2)
  const [bloodSodium, setBloodSodium] = useState(138)
  const [bloodPotassium, setBloodPotassium] = useState(4.4)
  const [bloodHemoglobin, setBloodHemoglobin] = useState(12.5)
  const [hematocritPcv, setHematocritPcv] = useState(40)
  const [wbcCount, setWbcCount] = useState(7800)
  const [rbcCount, setRbcCount] = useState(4.8)
  const [appetite, setAppetite] = useState('good')
  const [legSwelling, setLegSwelling] = useState('no')
  const [anemiaHistory, setAnemiaHistory] = useState('no')

  // 🚀 Core predictive risk simulation engine
  const handleCalculate = (e) => {
    e.preventDefault()

    // Strict clinical validations
    if (!patientName.trim() || !patientId.trim()) {
      alert("⚠️ Patient Identification Required:\nPlease enter the Patient Full Name and EMR Registry ID before running diagnostic estimations.")
      return
    }

    setIsCalculating(true)

    // Simulate model pre-computations and attributions
    setTimeout(() => {
      let riskScore = 0
      let reasons = []

      if (selectedDisease === 'diabetes') {
        // Base risk mapping
        if (bloodSugar > 125) {
          riskScore += 45
          reasons.push("Your blood sugar level is in the diabetes range (above 125 mg/dl).")
        } else if (bloodSugar > 100) {
          riskScore += 20
          reasons.push("Your blood sugar level indicates early signs of prediabetes.")
        }
        if (bodyWeight >= 30) {
          riskScore += 25
          reasons.push("Your body weight index maps as highly obese, causing high insulin stress.")
        } else if (bodyWeight >= 25) {
          riskScore += 12
          reasons.push("Your body weight is slightly above the healthy range.")
        }
        if (age > 45) {
          riskScore += 15
          reasons.push("Age above 45 increases metabolic processing decline.")
        }
        if (insulin > 150) {
          riskScore += 10
          reasons.push("Elevated 2-Hour insulin levels indicate active cellular resistance.")
        }
      } 
      
      else if (selectedDisease === 'heart') {
        if (systolicBp >= 140 || diastolicBp >= 90) {
          riskScore += 30
          reasons.push("Your resting blood pressure is significantly high, creating constant arterial strain.")
        } else if (systolicBp >= 130 || diastolicBp >= 80) {
          riskScore += 15
          reasons.push("Your resting blood pressure is moderately elevated.")
        }
        if (cholesterol > 240) {
          riskScore += 25
          reasons.push("Your blood cholesterol level is high, increasing artery blockage risks.")
        }
        if (blockedVessels > 0) {
          riskScore += 25
          reasons.push(`Fluoroscopy scans found ${blockedVessels} main heart blood vessels blocked.`);
        }
        if (heartStrain > 1.5) {
          riskScore += 15
          reasons.push("ECG readings identify severe heart strain during exercise.")
        }
        if (age > 50) {
          riskScore += 10
          reasons.push("Aging increases overall vascular wall stiffening risks.")
        }
      } 
      
      else if (selectedDisease === 'liver') {
        if (totalBilirubin > 2.0) {
          riskScore += 35
          reasons.push("Your liver bile waste (Bilirubin) is high, suggesting bile duct or cellular congestion.")
        }
        if (altEnzyme > 56) {
          riskScore += 30
          reasons.push("Liver cell irritation enzymes (ALT/SGPT) are elevated, pointing to liver inflammation.")
        }
        if (albumin < 3.5) {
          riskScore += 20
          reasons.push("Your liver protein synthesis (Albumin) is below normal, indicating liver cell fatigue.")
        }
        if (agRatio < 0.8) {
          riskScore += 15
          reasons.push("Your Albumin/Globulin ratio is low, mapping chronic liver stress.")
        }
      } 
      
      else if (selectedDisease === 'stroke') {
        if (highBpHistory === 'yes' || systolicBp >= 140) {
          riskScore += 35
          reasons.push("Active history of chronic high blood pressure significantly impacts vascular perfusion.")
        }
        if (bloodSugar > 140) {
          riskScore += 25
          reasons.push("Your blood sugar averages are high, which irritates cerebral blood vessel linings.")
        }
        if (heartTroubleHistory === 'yes') {
          riskScore += 20
          reasons.push("History of cardiac troubles elevates stroke risks from clot formations.")
        }
        if (smokingHistory === 'smokes') {
          riskScore += 15
          reasons.push("Active smoking narrows blood vessels and increases plaque rupturing risks.")
        }
        if (age > 60) {
          riskScore += 10
          reasons.push("Vascular walls age and naturally weaken over 60 years.")
        }
      } 
      
      else if (selectedDisease === 'kidney') {
        if (creatinineWaste > 1.5) {
          riskScore += 45
          reasons.push("Your kidney filtration waste (Creatinine) is high, signaling active kidney filtering decline.")
        }
        if (urineProteinLeak !== '0') {
          riskScore += 25
          reasons.push("Urine protein leak checks identified structural leakage from your kidney filters.")
        }
        if (urineDensity === '1.005' || urineDensity === '1.010') {
          riskScore += 15
          reasons.push("Urine specific gravity density is low, meaning your kidneys struggle to concentrate waste.")
        }
        if (bloodHemoglobin < 11.0) {
          riskScore += 15
          reasons.push("Low oxygen-carrying hemoglobin (Anemia) is a standard complication of chronic kidney strain.")
        }
        if (highBpHistory === 'yes' || diastolicBp >= 90) {
          riskScore += 10
          reasons.push("Unmanaged high blood pressure accelerates micro-vascular kidney damage.")
        }
      }

      // bound risk score cleanly
      riskScore = Math.min(Math.max(riskScore, 5), 98)
      
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
        patientName,
        patientId
      }

      setResult(newPrediction)
      setPredictions([newPrediction, ...predictions])
      setIsCalculating(false)
    }, 1200)
  }

  // simulated PDF Report compiler download
  const handleDownload = () => {
    if (!result) return
    
    alert(`💾 Clinical PDF Compile Success!\n\n` +
          `File: clinical_health_risk_report_${result.patientId}.pdf\n` +
          `Patient: ${result.patientName}\n` +
          `Clinician: EMR Diagnostics Platform\n` +
          `Diagnostic: ${result.disease} (${result.riskLevel} Risk - ${result.riskScore}%)\n\n` +
          `Saving compiled EMR report locally...`)
  }

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Dynamic Header navbar disease focus selector */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              🔬 Diagnostics Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Select your diagnostic focus from the dropdown. Vitals entered in the shared panel automatically map to all active disease calculations.
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
        {/* LEFT COLUMN: Combined Form */}
        <form onSubmit={handleCalculate} className="lg:col-span-7 space-y-6">
          {/* Section 1: Demographics & Identification */}
          <Card className="p-6">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              👤 Patient Profile & Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Patient Full Name"
                type="text"
                value={patientName}
                onChange={setPatientName}
                reference="Enter Patient Legal Name..."
              />
              <InputField 
                label="EMR Registry ID Number"
                type="text"
                value={patientId}
                onChange={setPatientId}
                reference="Enter Unique EMR ID..."
              />
            </div>
          </Card>

          {/* Section 2: Shared Vitals */}
          <Card className="p-6">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
              🩺 Shared Clinical Vitals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Patient Age"
                type="slider"
                min={1}
                max={110}
                value={age}
                onChange={setAge}
                reference="Standard patient age in years"
              />
              <InputField 
                label="Biological Sex"
                type="select"
                value={sex}
                onChange={setSex}
                options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]}
                reference="Sex at birth, used for metabolic rates"
              />
              <InputField 
                label="Fasting Blood Sugar level"
                type="slider"
                min={50}
                max={250}
                value={bloodSugar}
                onChange={setBloodSugar}
                tooltip="Fasting plasma glucose. Higher levels (above 100) are early warning indicators."
                reference="Healthy: Under 100 mg/dL"
              />
              <InputField 
                label="Body Weight level (BMI)"
                type="slider"
                min={10}
                max={50}
                value={bodyWeight}
                onChange={setBodyWeight}
                tooltip="Obesity ratio based on height and weight. High weight increases vascular stress."
                reference="Healthy range: 18.5 - 24.9"
              />
              <InputField 
                label="Resting Upper Blood Pressure (Systolic)"
                type="slider"
                min={80}
                max={200}
                value={systolicBp}
                onChange={setSystolicBp}
                tooltip="Arterial pressure when heart beats. High upper BP is cardiovascular strain."
                reference="Healthy: Under 120 mm Hg"
              />
              <InputField 
                label="Resting Lower Blood Pressure (Diastolic)"
                type="slider"
                min={50}
                max={120}
                value={diastolicBp}
                onChange={setDiastolicBp}
                tooltip="Arterial pressure when heart rests. High lower BP is general vascular strain."
                reference="Healthy: Under 80 mm Hg"
              />
            </div>
          </Card>

          {/* Section 3: Conditional Lab parameters based on selected disease */}
          {selectedDisease === 'diabetes' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                🧪 Diabetes Laboratory Panel
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
                    reference="Pregnancies count (female demographics)"
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
                  reference="Typical range: 10 - 50 mm"
                />
                <InputField 
                  label="2-Hour Blood Insulin level"
                  type="slider"
                  min={10}
                  max={600}
                  value={insulin}
                  onChange={setInsulin}
                  tooltip="2-Hour serum insulin level. High levels map metabolic insulin resistance."
                  reference="Typical range: 15 - 276 mu U/ml"
                />
                <InputField 
                  label="Family History Diabetes Score"
                  type="slider"
                  min={0.05}
                  max={2.5}
                  step={0.01}
                  value={pedigree}
                  onChange={setPedigree}
                  tooltip="Pedigree score mapping diabetes occurrences in direct blood relatives."
                  reference="Typical range: 0.08 - 2.40"
                />
              </div>
            </Card>
          )}

          {selectedDisease === 'heart' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                🧪 Cardio Stress Laboratory Markers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="Total Blood Cholesterol level"
                  type="slider"
                  min={100}
                  max={500}
                  value={cholesterol}
                  onChange={setCholesterol}
                  tooltip="Total fatty lipid counts. Over 240 is elevated, causing arterial blockage risk."
                  reference="Healthy target: Under 200 mg/dL"
                />
                <InputField 
                  label="Maximum Heart Rate Achieved (Pulse)"
                  type="slider"
                  min={60}
                  max={230}
                  value={pulse}
                  onChange={setPulse}
                  tooltip="Maximum recorded pulse rate during cardio stress activity."
                  reference="Maximum stress fitness target"
                />
                <InputField 
                  label="ECG Heart Strain level"
                  type="slider"
                  min={0.0}
                  max={8.0}
                  step={0.1}
                  value={heartStrain}
                  onChange={setHeartStrain}
                  tooltip="ECG stress strain wave depression. Higher levels suggest low cardiac oxygen."
                  reference="Healthy target: Under 1.0"
                />
                <InputField 
                  label="Blocked Coronary Vessels Count"
                  type="slider"
                  min={0}
                  max={4}
                  value={blockedVessels}
                  onChange={setBlockedVessels}
                  tooltip="Number of main coronary arteries found blocked under fluoroscopy scans."
                  reference="Healthy target: 0 vessels"
                />
                <InputField 
                  label="Chest Pain Severity Type"
                  type="select"
                  value={chestPain}
                  onChange={setChestPain}
                  options={[
                    { label: 'Non-Anginal Muscle Pain', value: 'nonanginal' },
                    { label: 'Typical Heart Angina', value: 'typical' },
                    { label: 'Atypical Non-Classic Pain', value: 'atypical' },
                    { label: 'No Chest Pain (Asymptomatic)', value: 'asymptomatic' }
                  ]}
                  reference="Clinical severity chest indicators"
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
                  reference="Cardio ECG wall thickness indicators"
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
                  reference="Thalassemia vascular perfusion scans"
                />
              </div>
            </Card>
          )}

          {selectedDisease === 'liver' && (
            <Card className="p-6">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                🧪 Hepatic Enzymes & Protein Panel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="Total Bilirubin (Yellow Bile Pigment)"
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
                  tooltip="Processed bile waste. High levels indicate direct hepatocyte injury."
                  reference="Healthy direct: 0.0 - 0.3 mg/dL"
                />
                <InputField 
                  label="Liver Alkaline Phosphatase (ALP)"
                  type="slider"
                  min={20}
                  max={500}
                  value={alpEnzyme}
                  onChange={setAlpEnzyme}
                  tooltip="Liver and bone enzyme. High values indicate biliary duct congestion."
                  reference="Healthy ALP: 44 - 147 IU/L"
                />
                <InputField 
                  label="ALT Liver Irritation Enzyme"
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
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                🏥 Medical History & Lifestyle Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="High Blood Pressure History?"
                  type="select"
                  value={highBpHistory}
                  onChange={setHighBpHistory}
                  options={[{ label: 'No History', value: 'no' }, { label: 'Yes (Active history)', value: 'yes' }]}
                  reference="Has chronic hypertension been diagnosed?"
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
                  reference="Cardio and vascular plaque narrow risks"
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
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                🧪 Renal Urinalysis & Blood Panel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                  label="Urine Specific Gravity (Density)"
                  type="select"
                  value={urineDensity}
                  onChange={setUrineDensity}
                  options={[
                    { label: '1.020 (Healthy concentration)', value: '1.020' },
                    { label: '1.025 (Healthy concentration)', value: '1.025' },
                    { label: '1.015 (Mild dilution)', value: '1.015' },
                    { label: '1.010 (Dilute urine / filter struggle)', value: '1.010' },
                    { label: '1.005 (Severe filter struggle)', value: '1.005' }
                  ]}
                  reference="Specific gravity renal density indicators"
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
                  label="Kidney Creatinine Waste level"
                  type="slider"
                  min={0.1}
                  max={15.0}
                  step={0.1}
                  value={creatinineWaste}
                  onChange={setCreatinineWaste}
                  tooltip="Serum Creatinine muscle wear waste. Highly sensitive marker for filtration decline."
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
              className="px-8 py-3.5 bg-blue-600 dark:bg-health-primary hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
            >
              Run Diagnostic Risk Estimation
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
