# 🏥 AI Healthcare Analytics Platform (Clini-SHAP)

Welcome to **Clini-SHAP**—a premium, clinical-grade decision support platform built to execute disease diagnostics risk scoring, showcase Explainable AI (**SHAP** interpretability) through layperson-friendly visuals, analyze clinical cohort trends, and generate structured Electronic Medical Record (EMR) reports.

I developed this platform as a modern, dual-architecture system featuring:
1. **Vite + React Frontend**: A premium, visual clinical dashboard with full-width widgets, typable range sliders, theme-matching custom dropdown selectors, and automated multi-disease risk calculators.
2. **Streamlit Backend & Diagnostic Suite**: A stand-alone, customizable clinical application serving as an alternative dashboard, complete with data loaders, SHAP beeswarm visualizations, and cohort analytics.

---

## 🌟 Core Features & Implementation Walkthrough

### 🔬 1. Coordinated Patient Diagnostic Suite (Unified EMR)
*   **Single-Entry Patient Profile**: Clinicians enter patient baseline vitals (Age, Sex, Diastolic/Systolic Blood Pressure, BMI, Fasting Glucose) **exactly once** in a single consolidated panel. Shared inputs are automatically mapped and fed into all active diagnostic models.
*   **Dynamic Active Diagnostics Toggles**: In the sidebar drawer, clinicians can toggle **ON or OFF** specific disease diagnostic evaluations on the fly.
*   **Conditional Lab Panels**: Specific lab tests (e.g. bilirubin, creatinine, specific gravity, pus cells, insulin) automatically render **only** for diseases that are active, keeping the workspace completely clean and targeted.
*   **Parallel Diagnostics Cards**: Running diagnostic evaluations executes scaling pipelines, ML predictions, and SHAP waterfall chart attributions for all active diseases side-by-side.
*   **customizable Clinician Profile**: Clinicians can dynamically input their own names. The system displays this active Clinician Name in the main EMR header and prints it cleanly in compiled PDF reports.

### 🎨 2. Premium UI & Dual Theme Engine
*   **Stand-alone Web Shell**: Custom-designed a glassmorphic **Top Header Navbar** with the clinic logo, active clinician session, and a glowing connection heartbeat.
*   **Interactive Light & Dark Modes**: Overhauled all styles and text elements to support a beautiful **☀️ Light Mode** and a robust **🌙 Dark Mode** toggle that dynamically swaps the entire canvas styling on the fly.
*   **Theme-Synchronized Visualizations**: All Plotly gauges, histograms, and SHAP Beeswarm summary charts automatically swap background templates, font colors, and gridline scales when toggling themes.
*   **Typable Range Sliders**: Numeric input indicators function as click-to-type inputs with bounds-clamping (e.g., Age 1-110, Height 50-220cm, Weight 5-185kg) to prevent unrealistic clinical entries.
*   **Themed Dropdown Selectors**: Native browser dropdown lists are replaced with a premium custom-styled React popover select component matching the clinical dashboard.

### 🧠 3. Explainable AI Center (SHAP) & Layman Wellness Dashboard
*   **Clinical to Layperson Translation**: Complex SHAP attributions are translated into clear, comforting **Wellness Score Contributors** using protector (green) vs. driver (red) indicators.
*   **Global Feature Importance**: High-fidelity horizontal bar charts detailing the mean absolute SHAP value impact across the validation cohort.
*   **SHAP Beeswarm Summary Plots**: Theme-synchronized beeswarm plots illustrating the directionality of clinical feature attributions (red representing high feature values, blue representing low feature values).

### 📈 4. Cohort Analytics & Trends
*   **Cohort Insights**: Plotly age histograms colored by diagnosis, alongside Pearson feature correlation matrices.
*   **Risk Factor Comparative Matrix**: Synthesized ranking mapping key risk factors across all 5 disease classifiers.
*   **Trend Analytics**: Line charts showing simulated month-on-month workflow screening volume and detection rates.

### 💡 5. Dynamic Care Advisor (Multi-Disease Tracking)
*   Built a personalized recommendation system that dynamically maps the latest EMR screening risk to quadrants: **Clinical Medical Management**, **Dietary Guidelines**, **Physical Activity**, and **Lifestyle Monitoring**, flagged with priority badges (Critical, Important, Suggested). Renders tabs for **all** high-risk active findings identified during active screenings.

### 📄 6. EMR Report Generator
*   Coded a professional EMR PDF compiler that compiles patient details, clinician case notes, selected risk results, observed parameters, and a rigorous legal disclaimer into a printable EMR diagnostics report.

---

## 📸 Interface Showcase

Here are the visual representations of the Clini-SHAP Intelligent CDSS platform interfaces:

### 1. Unified Risk Predictor Step-Wizard & Typable Sliders
Clinicians can interactively slide or click-to-type numerical vitals inputs, with a customizable clinical dropdown selector.
![Step Wizard & Sliders](screenshots/5_typable_sliders_inputs.png)

### 2. Custom Themed Select Dropdown Menu
A premium custom-styled popover dropdown replaces native browser dropdown lists.
![Themed Select Dropdown](screenshots/1_diagnostics_focus_dropdown.png)

### 3. Full-Width Visual Wellness Dashboard & Risk Indicators
A comprehensive visual health evaluation featuring circular dials, BMI trackers, and lifestyle score indicators.
![Full-Width Wellness Dashboard](screenshots/4_full_width_wellness_dashboard.png)

### 4. Layperson-Friendly Wellness Contributors & SHAP Attributions
Complex SHAP attributions translated into clear, comforting wellness score protector (-) and driver (+) matrices.
![Wellness Score Contributors](screenshots/2_wellness_score_contributors.png)

### 5. High-Fidelity PDF Clinical Report Compilation
Client-side PDF report compilation detailing patient metadata, diagnostics focus, and wellness indicators.
![PDF Print Preview](screenshots/3_pdf_print_preview.png)

---

## 🔬 Deep-Dive: Clinical Classifiers & Datasets Used

The platform coordinates **5 specialized machine learning models** trained on diverse, validated medical cohorts. Below are the details and official repository links for each dataset:

| Target Disease | Model Architecture | Core Predictive Features | Primary Dataset Link | Alternate Dataset Link |
| :--- | :--- | :--- | :--- | :--- |
| **🍬 Diabetes** | `XGBClassifier` | Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree Function, Age | [UCI Diabetes Dataset](https://archive.ics.uci.edu/dataset/21/pima+indians+diabetes) | [Kaggle Pima Indians Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) |
| **❤️ Cardiovascular** | `XGBClassifier` | Age, Sex, Chest Pain (CP), Resting Blood Pressure, Cholesterol, Fasting Blood Sugar, Resting ECG, Max Heart Rate, Exercise Angina, Oldpeak, ST Slope, Blocked Vessels (CA), Thalassemia Flow | [UCI Heart Disease Dataset](https://archive.ics.uci.edu/dataset/45/heart+disease) | [Kaggle Heart Disease Dataset](https://www.kaggle.com/datasets/johnsmith88/heart-disease-dataset) |
| **🧪 Liver Efficacy** | `XGBClassifier` | Age, Sex, Total Bilirubin, Direct Bilirubin, Alkaline Phosphotase, Alamine Aminotransferase, Aspartate Aminotransferase, Total Proteins, Albumin, Albumin/Globulin Ratio | [UCI ILPD Liver Dataset](https://archive.ics.uci.edu/dataset/225/ilpd+indian+liver+patient+dataset) | [Kaggle Indian Liver Patient Records](https://www.kaggle.com/datasets/uciml/indian-liver-patient-records) |
| **🧠 Stroke Risk** | `XGBClassifier` | Gender, Age, Hypertension, Heart Disease, Ever Married, Work Type, Residence Type, Avg Glucose Level, BMI, Smoking Status | [Kaggle Stroke Dataset](https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset) | [Cerebrovascular Stroke Records](https://www.kaggle.com/datasets/fedesoriano/stroke-prediction-dataset) |
| **🩸 Renal Kidney** | `RandomForestClassifier` | Age, Blood Pressure, Urine Specific Gravity, Urine Albumin/Sugar Leakage, Pus Cells, RBC, Pus Cell Clumps, Bacteria, Blood Glucose, Blood Urea, Serum Creatinine, Sodium, Potassium, Hemoglobin, PCV, WBC, RBC Counts | [UCI Chronic Kidney Disease](https://archive.ics.uci.edu/dataset/336/chronic+kidney+disease) | [Kaggle Chronic Kidney Disease](https://www.kaggle.com/datasets/mansoorgoku/ckdisease) |

---

## 📓 Google Colab Notebooks: Downloadable Model Training

The `notebooks/` directory contains both your **uploaded clinical training notebooks** and the **lightweight Google Colab templates**. These notebooks walk through the model training process step-by-step, covering exploratory data analysis (EDA), EMR preprocessing, train-test splits, model classification training (`XGBClassifier` and `RandomForestClassifier`), SHAP interpretability calibration, and model export operations.

### 📂 Your Uploaded Clinical Training Notebooks:
*   [01_diabetes_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/01_diabetes_training.ipynb)
*   [02_heart_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/02_heart_training.ipynb)
*   [03_liver_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/03_liver_training.ipynb)
*   [04_stroke_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/04_stroke_training.ipynb)
*   [05_kidney_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/05_kidney_training.ipynb)

### 📂 Google Colab Lightweight Model Training Templates:
*   [1_diabetes_model_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/1_diabetes_model_training.ipynb)
*   [2_heart_disease_model_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/2_heart_disease_model_training.ipynb)
*   [3_liver_disease_model_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/3_liver_disease_model_training.ipynb)
*   [4_stroke_risk_model_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/4_stroke_risk_model_training.ipynb)
*   [5_kidney_disease_model_training.ipynb](file:///Users/fatehahossainanushka/Documents/AI-Healthcare-Analytics-Platform/notebooks/5_kidney_disease_model_training.ipynb)

> [!TIP]
> To run these notebooks, upload them directly to [Google Colab](https://colab.research.google.com/), enable a GPU accelerator (if desired), and run all cells. They are fully self-contained and pre-configured!

---

## 🛠️ Technology Stack Used

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [React + Vite](https://vitejs.dev/) | High-performance visual UI rendering on port 5173 |
| **App Shell (Alternative)** | [Streamlit](https://streamlit.io/) | Stand-alone Python clinical dashboard on port 8501/8502 |
| **Machine Learning** | [XGBoost](https://xgboost.readthedocs.io/), [scikit-learn](https://scikit-learn.org/) | Pre-trained classifiers (`XGBClassifier`, `RandomForestClassifier`) |
| **Model Interpretability** | [SHAP](https://github.com/shap/shap) | Clinical local waterfall attributions and global beeswarm plots |
| **Visualizations** | [Plotly](https://plotly.com/), [Matplotlib](https://matplotlib.org/), [Seaborn](https://seaborn.pydata.org/) | Dynamic medical and statistical graphs |
| **PDF Compiler** | [FPDF2](https://github.com/pyfpdf/fpdf2), [html2pdf.js](https://html2pdf.js.org/) | Client-side EMR clinical report PDF generation |
| **Data Processing** | [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) | Continuous scaling and tabular EMR preprocessing |

---

## 🚀 How to Run the Project on Localhost

### Part 1: Running the Vite + React Frontend (Recommended)
The React frontend offers the premium, modern layout with typable sliders and a layperson-friendly dashboard.

1.  **Navigate to the Frontend Directory**:
    ```bash
    cd frontend
    ```
2.  **Install Node Dependencies**:
    ```bash
    npm install
    ```
3.  **Launch the Development Server**:
    ```bash
    npm run dev
    ```
4.  Open **`http://localhost:5173`** in your browser to experience the clinical wellness suite!

---

### Part 2: Running the Streamlit Backend & Analytics alternative
The Streamlit app serves the cohort insight histograms, Pearson correlations, and raw SHAP beeswarm graphs.

1.  **Return to Root Directory**:
    ```bash
    cd ..
    ```
2.  **Install System-level XGBoost Requirements (macOS only)**:
    Ensure OpenMP is active for high-performance predictions:
    ```bash
    brew install libomp
    ```
3.  **Install Python Libraries**:
    ```bash
    pip3 install -r requirements.txt
    ```
4.  **Run the Pre-computation & Metric Verification Pipeline**:
    ```bash
    python3 train_models.py
    ```
5.  **Launch the Streamlit Server**:
    ```bash
    streamlit run app.py
    ```
6.  Open **`http://localhost:8501`** (or `http://localhost:8502`) in your browser.

---

## 📁 Project Directory Structure

```
AI-Healthcare-Platform/
├── .streamlit/
│   └── config.toml          # Streamlit standard configuration file
├── notebooks/
│   ├── 01_diabetes_training.ipynb       # Your clinical Diabetes training notebook
│   ├── 02_heart_training.ipynb          # Your clinical Cardio training notebook
│   ├── 03_liver_training.ipynb          # Your clinical Liver training notebook
│   ├── 04_stroke_training.ipynb         # Your clinical Stroke training notebook
│   ├── 05_kidney_training.ipynb         # Your clinical Kidney training notebook
│   ├── 1_diabetes_model_training.ipynb  # Diabetes template XGBoost trainer
│   ├── 2_heart_disease_model_training.ipynb  # Cardio template XGBoost trainer
│   ├── 3_liver_disease_model_training.ipynb  # Liver template XGBoost trainer
│   ├── 4_stroke_risk_model_training.ipynb  # Stroke template XGBoost trainer
│   └── 5_kidney_disease_model_training.ipynb  # Kidney template RF trainer
├── data/
│   ├── diabetes.csv         # Pima Indians Diabetes Dataset
│   ├── heart.csv            # Cleveland Heart Disease Dataset
│   ├── liver.csv            # Indian Liver Patient Dataset
│   ├── stroke.csv           # Cerebrovascular Stroke Dataset
│   └── kidney.csv           # Chronic Kidney Disease Dataset
├── models/
│   ├── model_metrics.json   # EMR metrics cache
│   ├── *_model.pkl          # Pre-trained models
│   ├── *_scaler.pkl         # Pre-trained StandardScalers
│   ├── *_X_train.joblib     # Preprocessed baseline train references
│   └── *_columns.joblib     # Feature name maps
├── shap_files/
│   ├── *_shap_values.joblib # Pre-computed test set SHAP arrays
│   └── *_X_test.joblib      # Validation test samples
├── frontend/
│   ├── src/                 # React UI Components and Pages
│   │   ├── components/      # InputField, ResultBox, FooterContactForm
│   │   ├── pages/           # Predict, Dashboard, CareAdvisor
│   │   └── App.jsx          # Main application router and state coordinator
│   ├── package.json         # Node package configuration
│   └── vite.config.js       # Vite build configurations
├── requirements.txt         # Python libraries
├── train_models.py          # EMR verification & SHAP pipeline script
├── app.py                   # Streamlit clinical dashboard entry point
└── README.md                # Project documentation (This file)
```

---

## 🛡️ Streamlit Cloud Deployment Guidelines
To deploy the Streamlit application to Streamlit Cloud for instant public access:
1.  **Commit and Push All Local Changes**:
    Ensure your git repository is pushed to your remote GitHub branch:
    ```bash
    git add .
    ```
    ```bash
    git commit -m "feat: integrate notebooks and professional developer documentation"
    ```
    ```bash
    git push origin main
    ```
2.  **Connect to Streamlit Cloud**:
    *   Navigate to [Streamlit Share](https://share.streamlit.io/).
    *   Sign in with your GitHub account.
    *   Click **"Create app"**.
3.  **Configure Deployment**:
    *   **Repository**: Select your repository (e.g., `anushka06onu/AI-Healthcare-Analytics-Platform`).
    *   **Branch**: Select your deployment branch (e.g., `main`).
    *   **Main file path**: Set to **`app.py`**.
4.  Click **"Deploy!"**. Streamlit Cloud will automatically build your python environment using `requirements.txt` and launch your clinical application.

---

## ⚠️ EMR Clinical Disclaimer

> **This platform was built for clinical research, data exploration, and analytics validation.**
> The models integrated within this application are predictive classifiers designed to serve strictly as analytical decision support tools. They **MUST NOT** be used as a standalone diagnostic substitute or alternative for professional clinical consultation, bedside diagnostic physical evaluation, or direct laboratory verification by a licensed physician.

---

Built with ❤️ by Anushka06onu