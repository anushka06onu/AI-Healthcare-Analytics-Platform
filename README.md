# 🏥 AI Healthcare Analytics Platform (Python & Streamlit)

A premium, AI-powered healthcare analytics platform for disease prediction, explainable AI, comprehensive analytics, PDF report generation, and personalized health recommendations, powered by **scikit-learn** and **SHAP**.

![Platform](https://img.shields.io/badge/Platform-Python-blue)
![UI](https://img.shields.io/badge/UI-Streamlit-orange)
![ML](https://img.shields.io/badge/ML-scikit--learn-green)
![Explainability](https://img.shields.io/badge/XAI-SHAP-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Key Modules & Features

### 📊 Dashboard Overview
- Real-time overview of active diagnostics models with accuracies, AUC-ROC, and cohort size metrics.
- Grouped bar charts comparing model metrics (Accuracy, AUC-ROC, F1-Score) using interactive Plotly visuals.
- Pie charts displaying screening cohort positive pre-valence rates.
- EMR Screening log detailing patient name, disease, calculated risk score, and severity classification history.

### 🔬 Disease Diagnostics Predictors
- Fully trained predictive random forest classifiers for four primary chronic disorders:
  - **Diabetes** — 8 parameters (Pregnancies, Glucose, Insulin, etc.) from the Pima Indians dataset.
  - **Heart Disease** — 13 parameters (chest pain, blood pressure, cholesterol, resting ECG) from the Cleveland dataset.
  - **Liver Disease** — 10 parameters (bilirubin, SGPT/SGOT, proteins) from the Indian Liver Patient dataset.
  - **Stroke** — 10 risk factors (hypertension, smoking status, average glucose, BMI, work type) from the stroke cohort.
- Dynamic gauge indicator mapping exact probability percentages.
- **Real-time Local SHAP Explanations**: Interactive horizontal contribution charts illustrating which specific patient features increased (red) or decreased (green) their risk classification.

### 🔍 Explainable AI (SHAP Interpretability)
- **Global Feature Importance**: Interactive horizontal bar charts illustrating the mean absolute impact of features across the test cohort.
- **SHAP Beeswarm Summary Plots**: Full directional Beeswarm plots generated using Matplotlib showing color-coded feature level impacts.

### 📈 Analytics & Insights
- **Cohort Insights**: Real-time histograms illustrating age distributions colored by diagnostic outcome, alongside Pearson feature correlation matrices.
- **Risk Factor Matrix**: Cross-disease comparative matrix detailing SHAP priority indicators.
- **Trends**: Line charts showing simulated month-on-month workflow screening volume.

### 💡 Recommendation System
- Dynamically loads the latest patient risk classification and synthesizes customized priority actions.
- Categorized quadrants: **Clinical Medical Management**, **Dietary Guidelines**, **Physical Activity**, and **Lifestyle Monitoring** flagged with priority levels.

### 📄 Clinical Report Generator
- Multi-field clinician case notes form.
- Select checkboxes to choose which disease screening profiles to compile.
- **EMR PDF Export**: Professional clean clinical report generated client-side using `fpdf2` containing patient profiles, patient-level clinical variables, a standard legal medical disclaimer, and print headers.

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **App Framework** | [Streamlit](https://streamlit.io/) | Premium glassmorphism dark-themed UI dashboard |
| **Machine Learning** | [scikit-learn](https://scikit-learn.org/) | Random Forest Classifiers with balanced class weights |
| **Explainability** | [SHAP](https://github.com/shap/shap) | Game-theoretic local and global feature attribution |
| **Visualizations** | [Plotly](https://plotly.com/), [Matplotlib](https://matplotlib.org/), [Seaborn](https://seaborn.pydata.org/) | Dynamic and high-fidelity analytical charts |
| **PDF Engine** | [FPDF2](https://github.com/pyfpdf/fpdf2) | Client-side clinical EMR report compilation |
| **Data Pipelines** | [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) | High-speed tabular feature processing |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/anushka06onu/AI-Healthcare-Analytics-Platform.git
cd AI-Healthcare-Analytics-Platform
```

### 2. Install Dependencies
Ensure Python 3.10+ is installed locally, then run:
```bash
pip install -r requirements.txt
```

### 3. Train Models & Pre-calculate SHAP
Run the pipeline script to preprocess data, train Random Forest classifiers, serialize models, and pre-calculate SHAP values for the analytics page:
```bash
python3 train_models.py
```

### 4. Run the Streamlit Dashboard
```bash
streamlit run app.py
```
Open the provided local URL (typically `http://localhost:8501`) in your browser to interact with the platform.

---

## 📁 Project Structure

```
AI-Healthcare-Platform/
├── .streamlit/
│   └── config.toml          # Dark theme color configuration
├── data/
│   ├── diabetes.csv         # Pima Indians Diabetes Dataset
│   ├── heart.csv            # Cleveland Heart Disease Dataset
│   ├── liver.csv            # Indian Liver Patient Dataset
│   └── stroke.csv           # Cerebrovascular Stroke Dataset
├── models/
│   ├── model_metrics.json   # Serialized model metrics for UI
│   ├── *_model.joblib       # Trained RandomForest models
│   ├── *_X_train.joblib     # Serialized training background data
│   └── *_columns.joblib     # Preprocessed feature lists
├── shap_files/
│   ├── *_explainer.joblib   # Serialized TreeExplainer objects
│   ├── *_shap_values.joblib # Serialized SHAP values
│   └── *_X_test.joblib      # Validation test sets
├── requirements.txt         # Package dependencies list
├── train_models.py          # Data prep, training, and SHAP pipeline
├── app.py                   # Main Streamlit web dashboard application
└── README.md                # Documentation
```

---

## ⚠️ Medical Disclaimer

> **This platform is built for clinical research, data exploration, and analytics validation.**
> The models trained within this application are predictive classifiers and **MUST NOT** be used as a standalone diagnostic substitute or alternative for professional medical advice, diagnosing, or EMR assessment by a licensed physician. Always consult qualified clinical healthcare professionals regarding physical medical choices.

---

Built with ❤️ using AI Healthcare Analytics