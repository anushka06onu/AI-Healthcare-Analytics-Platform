# 🏥 AI Healthcare Analytics Platform (Clini-SHAP)

Welcome to **Clini-SHAP**—a premium, clinical-grade decision support dashboard I built to execute disease diagnostics risk scoring, showcase Explainable AI (**SHAP** interpretability), analyze clinical cohort trends, and generate structured EMR (Electronic Medical Record) reports.

I developed this platform as a full-stack Python application using **Streamlit** for the clinical UI, **scikit-learn** and **XGBoost** for the predictive models, and **SHAP** for local and global model interpretability.

To make the platform highly professional, production-ready, and accessible to everyone, I overhauled the user interface with a custom modern layout, fully translated all complex medical parameters into layman-friendly everyday terms, and integrated a **Unified Patient Diagnostic Suite** that eliminates dummy data.

---

## 🌟 Core Features I Developed

### 🔬 Coordinated Patient Diagnostic Suite (New EMR Standard)
- **Unified Patient Vitals Form**: Clinicians enter patient baseline vitals (Age, Sex, Diastolic/Systolic Blood Pressure, BMI, Fasting Glucose) **exactly once** in a single consolidated panel. Shared inputs are dynamically mapped and fed into all active diagnostic models simultaneously behind the scenes.
- **Dynamic Active Diagnostics Toggles**: In the left sidebar drawer, clinicians can turn **ON or OFF** specific disease diagnostic evaluations on the fly.
- **Conditional Lab Panels**: Specific lab tests (e.g. bilirubin, creatinine, specific gravity, pus cells, insulin) automatically render **only** for diseases that are turned "ON" in the active diagnostics list, keeping the workspace completely clean and targeted.
- **Parallel Diagnostics Cards**: Clicking a single run button executes scaling pipelines, ML predictions, and SHAP waterfall chart attributions for **all active diseases side-by-side** in a beautiful, parallel responsive grid.
- **Strict Production Validations (Purged Dummy Data)**: Purged all placeholder text (such as "Jane Doe"). Patient Name and EMR Registry fields are empty by default, and strict EMR alerts prevent calculations unless proper clinical metadata is provided.
- **customizable Clinician Profile**: Clinicians can dynamically input their own names in the sidebar panel. The system displays this active Clinician Name in the main EMR header and prints it cleanly in compiled PDF reports.

### 🎨 Premium UI & Dual Theme Engine
- **Stand-alone Web Shell**: Custom-designed a glassmorphic **Top Header Navbar** with the clinic logo, active clinician session, and a glowing connection heartbeat.
- **Restored Drawer Toggles**: Re-exposed and visually styled Streamlit's native sidebar expand/collapse button (arrow toggle) so that users can slide the navigation drawer open or closed.
- **Bespoke Sidebar Drawer Menu**: Sidebar pages styled as vertical interactive tabs featuring clean focus borders, shadows, hover transitions, and diagnostic icons.
- **Interactive Light & Dark Modes**: Overhauled all styles and text elements to support a beautiful **☀️ Light Mode** and a robust **🌙 Dark Mode** toggle that dynamically swaps the entire canvas styling on the fly.
- **Theme-Synchronized Visualizations**: All Plotly gauges, histograms, and SHAP Beeswarm summary charts automatically swap background templates, font colors, and gridline scales when toggling themes.

### 🧠 Explainable AI Center (SHAP)
To guarantee complete diagnostic accountability, I integrated **SHAP (SHapley Additive exPlanations)**:
- **Global Feature Importance**: High-fidelity horizontal bar charts detailing the mean absolute SHAP value impact across the validation cohort.
- **SHAP Beeswarm Summary Plots**: Theme-synchronized beeswarm plots illustrating the directionality of clinical feature attributions (red representing high feature values, blue representing low feature values).

### 📈 Cohort Analytics & Trends
- **Cohort Insights**: Plotly age histograms colored by diagnosis, alongside Pearson feature correlation matrices.
- **Risk Factor Comparative Matrix**: Synthesized ranking mapping key risk factors across all 5 disease classifiers.
- **Trend Analytics**: Line charts showing simulated month-on-month workflow screening volume and detection rates.

### 💡 Dynamic Care Advisor (Multi-Disease Tracking)
- Built a personalized recommendation system that dynamically maps the latest EMR screening risk to quadrants: **Clinical Medical Management**, **Dietary Guidelines**, **Physical Activity**, and **Lifestyle Monitoring**, flagged with priority badges (Critical, Important, Suggested). Renders tabs for **all** high-risk active findings identified during active screenings.

### 📄 EMR Report Generator
- Coded a EMR PDF compiler using `fpdf2` that compiles patient details, clinician case notes, selected risk results, observed parameters, and a rigorous legal disclaimer into a printable EMR diagnostics report.

---

## 🛠️ Technology Stack I Used

| Layer | Technology | Purpose |
|---|---|---|
| **App Framework** | [Streamlit](https://streamlit.io/) | Stand-alone, customized, glassmorphic clinical UI |
| **Machine Learning** | [XGBoost](https://xgboost.readthedocs.io/), [scikit-learn](https://scikit-learn.org/) | Pre-trained high-performance classifiers |
| **Model Interpretability** | [SHAP](https://github.com/shap/shap) | Local waterfall attributions and global beeswarm plots |
| **Visualizations** | [Plotly](https://plotly.com/), [Matplotlib](https://matplotlib.org/), [Seaborn](https://seaborn.pydata.org/) | Dynamic medical and statistical visual graphs |
| **PDF Compiler** | [FPDF2](https://github.com/pyfpdf/fpdf2) | Client-side EMR clinical report PDF generation |
| **Data Processing** | [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) | Continuous scaling and tabular EMR preprocessing |

---

## 🚀 How to Run the Project on Localhost

Follow these steps to set up the project environment and launch the web server on your local machine:

### 1. Clone My Repository
```bash
git clone https://github.com/anushka06onu/AI-Healthcare-Analytics-Platform.git
cd AI-Healthcare-Analytics-Platform
```

### 2. Switch to the Development Branch
Ensure you are on the `dev` branch where all the pre-trained `.pkl` models and EMR StandardScalers are active:
```bash
git checkout dev
```

### 3. Install the Dependencies
Ensure you have Python 3.10+ installed, then run the macOS package installers:
```bash
# Install the OpenMP runtime required by XGBoost C++ core on macOS
brew install libomp

# Install locked python packages
pip3 install -r requirements.txt
```

### 4. Run the Pre-computation Pipeline
Execute the EMR metrics and SHAP pre-calculation script. This validates the pre-trained `.pkl` models against the validation cohort and pre-saves the matrices for instant dashboard rendering:
```bash
python3 train_models.py
```

### 5. Launch the Clinical Dashboard on Localhost
Start the Streamlit local web server:
```bash
streamlit run app.py
```
Open the provided URL—typically **`http://localhost:8502`**—in your browser to interact with my platform!

---

## 📁 Project Directory Structure

```
AI-Healthcare-Platform/
├── .streamlit/
│   └── config.toml          # Streamlit standard config files
├── data/
│   ├── diabetes.csv         # Pima Indians Diabetes Dataset
│   ├── heart.csv            # Cleveland Heart Disease Dataset
│   ├── liver.csv            # Indian Liver Patient Dataset
│   ├── stroke.csv           # Cerebrovascular Stroke Dataset
│   └── kidney.csv           # Chronic Kidney Disease Dataset (Converted from ARFF)
├── models/
│   ├── model_metrics.json   # Validated EMR performance parameters
│   ├── *_model.pkl          # My pre-trained XGBoost & Random Forest models
│   ├── *_scaler.pkl         # My pre-trained EMR StandardScalers
│   ├── *_X_train.joblib     # Preprocessed baseline train references
│   └── *_columns.joblib     # Feature name maps
├── shap_files/
│   ├── *_shap_values.joblib # Pre-computed test set SHAP arrays
│   └── *_X_test.joblib      # Validation test samples
├── requirements.txt         # Project package requirements list
├── train_models.py          # My EMR verification & SHAP pipeline script
├── app.py                   # My core Streamlit clinical web application
└── README.md                # This documentation
```

---

## ⚠️ EMR Clinical Disclaimer

> **This platform was built for clinical research, data exploration, and analytics validation.**
> The models integrated within this application are predictive classifiers designed to serve strictly as analytical decision support tools. They **MUST NOT** be used as a standalone diagnostic substitute or alternative for professional clinical consultation, bedside diagnostic physical evaluation, or direct laboratory verification by a licensed physician.

---

Built with ❤️ by Anushka06onu