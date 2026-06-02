import os
import json
import datetime
import joblib
import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import matplotlib.pyplot as plt
import seaborn as sns
import shap
from fpdf import FPDF

# Set Streamlit Page Config
st.set_page_config(
    page_title="AI Healthcare Analytics Platform",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Premium CSS Styling
st.markdown("""
<style>
    /* Global Background and Fonts */
    .stApp {
        background-color: #0a0b10;
        color: #f8f9fa;
    }
    
    /* Neon glassmorphism style card */
    .metric-card {
        background: rgba(18, 20, 32, 0.65);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 240, 255, 0.15);
        border-radius: 12px;
        padding: 20px;
        margin: 10px 0px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        transition: transform 0.2s, border-color 0.2s;
    }
    .metric-card:hover {
        transform: translateY(-2px);
        border-color: rgba(0, 240, 255, 0.35);
    }
    
    .metric-title {
        color: #8f94a6;
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .metric-value {
        color: #00f0ff;
        font-size: 2.2rem;
        font-weight: 700;
        text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
    }
    
    .metric-sub {
        color: #8f94a6;
        font-size: 0.8rem;
        margin-top: 5px;
    }
    .metric-sub span {
        color: #00f0ff;
        font-weight: bold;
    }
    
    /* Sidebar Navigation Customization */
    [data-testid="stSidebar"] {
        background-color: #0c0e17 !important;
        border-right: 1px solid rgba(0, 240, 255, 0.08) !important;
    }
    
    /* Styled tags */
    .risk-high {
        color: #ff4d4d;
        font-weight: 700;
        text-shadow: 0 0 8px rgba(255, 77, 77, 0.4);
    }
    .risk-moderate {
        color: #ff9f1a;
        font-weight: 700;
        text-shadow: 0 0 8px rgba(255, 159, 26, 0.4);
    }
    .risk-low {
        color: #2ed573;
        font-weight: 700;
        text-shadow: 0 0 8px rgba(46, 213, 115, 0.4);
    }
    
    /* Sections Headers */
    .section-header {
        font-size: 1.8rem;
        color: #ffffff;
        font-weight: 700;
        margin-bottom: 20px;
        border-left: 4px solid #00f0ff;
        padding-left: 12px;
    }
</style>
""", unsafe_allow_html=True)

# ------------------------------------------------------------
# SESSION STATE INITIALIZATION
# ------------------------------------------------------------
if 'predictions' not in st.session_state:
    st.session_state.predictions = []

# Helper: Load model metrics
@st.cache_data
def load_metrics():
    try:
        with open('models/model_metrics.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# Helper: Load saved model components
@st.cache_resource
def load_model_components(disease_name):
    model = joblib.load(f'models/{disease_name}_model.joblib')
    columns = joblib.load(f'models/{disease_name}_columns.joblib')
    X_train = joblib.load(f'models/{disease_name}_X_train.joblib')
    explainer = joblib.load(f'shap_files/{disease_name}_explainer.joblib')
    return model, columns, X_train, explainer

# Helper: Get Robust SHAP values for 1 prediction
def get_shap_contributions(explainer, X_sample):
    shap_val_raw = explainer.shap_values(X_sample)
    if isinstance(shap_val_raw, list):
        vals = shap_val_raw[1] if len(shap_val_raw) > 1 else shap_val_raw[0]
    elif isinstance(shap_val_raw, np.ndarray):
        if len(shap_val_raw.shape) == 3:
            vals = shap_val_raw[0, :, 1]
        elif len(shap_val_raw.shape) == 2:
            vals = shap_val_raw[0]
        else:
            vals = shap_val_raw
    else:
        try:
            vals = shap_val_raw.values[0]
        except AttributeError:
            vals = shap_val_raw[0]
            
    if len(np.shape(vals)) == 2:
        vals = vals[0]
    return vals

# ------------------------------------------------------------
# SIDEBAR NAVIGATION
# ------------------------------------------------------------
with st.sidebar:
    st.markdown("<h2 style='text-align: center; color: #00f0ff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.4); margin-bottom: 5px;'>🏥 AI Healthcare</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #8f94a6; font-size: 0.9rem; margin-top:0px;'>Clinical Decision Support Platform</p>", unsafe_allow_html=True)
    st.markdown("---")
    
    page = st.radio(
        "Navigation Menu",
        options=[
            "Dashboard Overview",
            "Diabetes Predictor",
            "Heart Disease Predictor",
            "Liver Disease Predictor",
            "Stroke Predictor",
            "Explainable AI (SHAP)",
            "Analytics & Insights",
            "Recommendations System",
            "Clinical Report Generator"
        ]
    )
    
    st.markdown("---")
    st.markdown("""
    <div style='background: rgba(18, 20, 32, 0.5); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 77, 77, 0.15);'>
        <p style='color: #ff4d4d; font-size: 0.75rem; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;'>⚠️ Clinical Disclaimer</p>
        <p style='color: #8f94a6; font-size: 0.7rem; margin: 0;'>This tool is intended for research and analytical demonstration purposes only. It is not an alternative to professional clinical consulting or diagnostic procedures.</p>
    </div>
    """, unsafe_allow_html=True)

metrics = load_metrics()

# ------------------------------------------------------------
# DASHBOARD OVERVIEW PAGE
# ------------------------------------------------------------
if page == "Dashboard Overview":
    st.markdown("<div class='section-header'>🏥 AI Healthcare Analytics Dashboard</div>", unsafe_allow_html=True)
    st.markdown("Welcome to the **AI Clinical Decision Support & Explainable Platform**. Get real-time predictive diagnostic support powered by validated Random Forest models and SHAP interpretability.")
    
    # Model performance cards
    st.markdown("### Active Diagnostics Models")
    cols = st.columns(4)
    disease_titles = {
        "diabetes": "Diabetes Diagnostic",
        "heart": "Heart Disease Diagnostic",
        "liver": "Liver Disease Diagnostic",
        "stroke": "Stroke Predictor"
    }
    
    for i, (key, title) in enumerate(disease_titles.items()):
        with cols[i]:
            if key in metrics:
                acc = metrics[key]['accuracy'] * 100
                auc = metrics[key]['roc_auc'] * 100
                samples = metrics[key]['samples']
                st.markdown(f"""
                <div class='metric-card'>
                    <div class='metric-title'>{title}</div>
                    <div class='metric-value'>{acc:.1f}%</div>
                    <div class='metric-sub'>AUC-ROC: <span>{auc:.1f}%</span></div>
                    <div class='metric-sub'>Cohort Size: <span>{samples} patients</span></div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class='metric-card'>
                    <div class='metric-title'>{title}</div>
                    <div class='metric-value'>N/A</div>
                    <div class='metric-sub'>Run model training script first.</div>
                </div>
                """, unsafe_allow_html=True)
                
    st.markdown("---")
    
    # Grid of charts
    chart_col1, chart_col2 = st.columns([3, 2])
    
    with chart_col1:
        st.markdown("### 📊 Model Evaluation Performance Comparison")
        if metrics:
            m_df = pd.DataFrame(metrics).T.reset_index()
            m_df['index'] = m_df['index'].str.upper()
            fig = go.Figure()
            fig.add_trace(go.Bar(
                x=m_df['index'],
                y=m_df['accuracy'],
                name='Accuracy',
                marker_color='#00f0ff'
            ))
            fig.add_trace(go.Bar(
                x=m_df['index'],
                y=m_df['roc_auc'],
                name='AUC-ROC',
                marker_color='#4ade80'
            ))
            fig.add_trace(go.Bar(
                x=m_df['index'],
                y=m_df['f1'],
                name='F1-Score',
                marker_color='#a78bfa'
            ))
            fig.update_layout(
                barmode='group',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#e2e8f0'),
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)', tickformat=".0%"),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            st.plotly_chart(fig, use_container_width=True)
            
    with chart_col2:
        st.markdown("### 🧪 Screening Cohort Prevalence Distributions")
        if metrics:
            p_df = pd.DataFrame([
                {"Disease": "Diabetes", "Prevalence": metrics['diabetes']['positive_prevalence']},
                {"Disease": "Heart", "Prevalence": metrics['heart']['positive_prevalence']},
                {"Disease": "Liver", "Prevalence": metrics['liver']['positive_prevalence']},
                {"Disease": "Stroke", "Prevalence": metrics['stroke']['positive_prevalence']}
            ])
            fig_pie = px.pie(
                p_df,
                values='Prevalence',
                names='Disease',
                hole=0.4,
                color_discrete_sequence=['#00f0ff', '#4ade80', '#a78bfa', '#ff9f1a']
            )
            fig_pie.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#e2e8f0'),
                legend=dict(orientation="h", yanchor="bottom", y=-0.1, xanchor="center", x=0.5)
            )
            st.plotly_chart(fig_pie, use_container_width=True)
            
    st.markdown("---")
    
    # Recent Predictions Section
    st.markdown("### 📋 Recent Diagnostic Screenings History (This Session)")
    if st.session_state.predictions:
        p_history = []
        for p in st.session_state.predictions:
            p_history.append({
                "Timestamp": p['timestamp'],
                "Patient Name": p['patient_name'],
                "Disease Diagnostic": p['disease'],
                "Calculated Risk Probability": f"{p['probability']*100:.1f}%",
                "Assigned Risk Level": p['risk_level']
            })
        st.table(pd.DataFrame(p_history))
    else:
        st.info("No screenings performed yet in this session. Head to a disease predictor in the left menu to start diagnostic profiling.")

# ------------------------------------------------------------
# DIAGNOSTICS PREDICTOR MODULES
# ------------------------------------------------------------
elif "Predictor" in page:
    disease_map = {
        "Diabetes Predictor": "diabetes",
        "Heart Disease Predictor": "heart",
        "Liver Disease Predictor": "liver",
        "Stroke Predictor": "stroke"
    }
    d_name = disease_map[page]
    d_title = page.replace("Predictor", "Diagnostic Profiling")
    
    st.markdown(f"<div class='section-header'>{d_title}</div>", unsafe_allow_html=True)
    
    try:
        model, columns, X_train, explainer = load_model_components(d_name)
    except FileNotFoundError:
        st.error(f"Saved model components for **{d_name}** not found. Please run the model training script `train_models.py` first to generate models and SHAP data.")
        st.stop()
        
    st.markdown("Fill out the patient clinical metadata form below to execute risk prediction and evaluate SHAP feature explanations.")
    
    col_f, col_r = st.columns([3, 2])
    
    with col_f:
        st.markdown("### Clinical Inputs Form")
        with st.form("clinical_form"):
            patient_name = st.text_input("Patient Name", value="Jane Doe")
            patient_id = st.text_input("Patient Clinical ID/EMR Number", value="EMR-98231")
            
            inputs = {}
            
            # Construct forms dynamically matching feature list
            if d_name == "diabetes":
                inputs['Pregnancies'] = st.slider("Pregnancies (Number of times pregnant)", 0, 20, 3)
                inputs['Glucose'] = st.slider("Plasma Glucose Concentration (2 hours in GTT)", 0, 200, 117)
                inputs['BloodPressure'] = st.slider("Diastolic Blood Pressure (mm Hg)", 0, 150, 72)
                inputs['SkinThickness'] = st.slider("Triceps Skin Fold Thickness (mm)", 0, 100, 23)
                inputs['Insulin'] = st.slider("2-Hour Serum Insulin (mu U/ml)", 0, 900, 30)
                inputs['BMI'] = st.slider("Body Mass Index (weight in kg/(height in m)^2)", 0.0, 70.0, 32.0, 0.1)
                inputs['DiabetesPedigreeFunction'] = st.slider("Diabetes Pedigree Function Value", 0.0, 3.0, 0.37, 0.01)
                inputs['Age'] = st.slider("Patient Age (Years)", 21, 120, 29)
                
            elif d_name == "heart":
                inputs['age'] = st.slider("Patient Age (Years)", 1, 120, 55)
                sex_lbl = st.selectbox("Biological Sex", ["Female", "Male"], index=1)
                inputs['sex'] = 1 if sex_lbl == "Male" else 0
                
                cp_lbl = st.selectbox("Chest Pain Type (cp)", ["Typical Angina", "Atypical Angina", "Non-anginal Pain", "Asymptomatic"], index=2)
                cp_map = {"Typical Angina": 0, "Atypical Angina": 1, "Non-anginal Pain": 2, "Asymptomatic": 3}
                inputs['cp'] = cp_map[cp_lbl]
                
                inputs['trestbps'] = st.slider("Resting Blood Pressure (mm Hg)", 80, 220, 130)
                inputs['chol'] = st.slider("Serum Cholesterol (mg/dl)", 100, 600, 240)
                
                fbs_lbl = st.selectbox("Fasting Blood Sugar > 120 mg/dl (fbs)", ["No", "Yes"], index=0)
                inputs['fbs'] = 1 if fbs_lbl == "Yes" else 0
                
                restecg_lbl = st.selectbox("Resting Electrocardiographic Results (restecg)", ["Normal", "ST-T Wave Abnormality", "Left Ventricular Hypertrophy"], index=0)
                restecg_map = {"Normal": 0, "ST-T Wave Abnormality": 1, "Left Ventricular Hypertrophy": 2}
                inputs['restecg'] = restecg_map[restecg_lbl]
                
                inputs['thalach'] = st.slider("Maximum Heart Rate Achieved (thalach)", 50, 250, 153)
                
                exang_lbl = st.selectbox("Exercise Induced Angina (exang)", ["No", "Yes"], index=0)
                inputs['exang'] = 1 if exang_lbl == "Yes" else 0
                
                inputs['oldpeak'] = st.slider("ST Depression Induced by Exercise Relative to Rest (oldpeak)", 0.0, 10.0, 0.8, 0.1)
                
                slope_lbl = st.selectbox("Slope of the Peak Exercise ST Segment (slope)", ["Upsloping", "Flat", "Downsloping"], index=1)
                slope_map = {"Upsloping": 0, "Flat": 1, "Downsloping": 2}
                inputs['slope'] = slope_map[slope_lbl]
                
                inputs['ca'] = st.slider("Number of Major Vessels Colored by Flourosopy (ca)", 0, 4, 0)
                
                thal_lbl = st.selectbox("Thalassemia Status (thal)", ["Normal", "Fixed Defect", "Reversible Defect"], index=1)
                thal_map = {"Normal": 1, "Fixed Defect": 2, "Reversible Defect": 3}
                inputs['thal'] = thal_map[thal_lbl]
                
            elif d_name == "liver":
                inputs['Age'] = st.slider("Patient Age (Years)", 1, 120, 45)
                gender_lbl = st.selectbox("Gender", ["Female", "Male"], index=1)
                inputs['Gender'] = 1 if gender_lbl == "Male" else 0
                
                inputs['Total_Bilirubin'] = st.slider("Total Bilirubin (mg/dl)", 0.1, 80.0, 1.0, 0.1)
                inputs['Direct_Bilirubin'] = st.slider("Direct Bilirubin (mg/dl)", 0.1, 40.0, 0.3, 0.1)
                inputs['Alkaline_Phosphotase'] = st.slider("Alkaline Phosphotase (IU/L)", 10, 3000, 208)
                inputs['Alamine_Aminotransferase'] = st.slider("Alamine Aminotransferase (SGPT) (IU/L)", 10, 2000, 35)
                inputs['Aspartate_Aminotransferase'] = st.slider("Aspartate Aminotransferase (SGOT) (IU/L)", 10, 5000, 42)
                inputs['Total_Protiens'] = st.slider("Total Protiens (g/dl)", 2.0, 10.0, 6.6, 0.1)
                inputs['Albumin'] = st.slider("Albumin (g/dl)", 0.9, 6.0, 3.1, 0.1)
                inputs['Albumin_and_Globulin_Ratio'] = st.slider("Albumin and Globulin Ratio", 0.1, 3.0, 0.93, 0.01)
                
            elif d_name == "stroke":
                gender_lbl = st.selectbox("Gender", ["Female", "Male", "Other"], index=0)
                inputs['gender'] = {"Female": 0, "Male": 1, "Other": 2}[gender_lbl]
                
                inputs['age'] = st.slider("Patient Age (Years)", 1.0, 120.0, 45.0, 1.0)
                
                hyper_lbl = st.selectbox("Hypertension Status", ["No", "Yes"], index=0)
                inputs['hypertension'] = 1 if hyper_lbl == "Yes" else 0
                
                hd_lbl = st.selectbox("Heart Disease History", ["No", "Yes"], index=0)
                inputs['heart_disease'] = 1 if hd_lbl == "Yes" else 0
                
                married_lbl = st.selectbox("Ever Married?", ["No", "Yes"], index=1)
                inputs['ever_married'] = 1 if married_lbl == "Yes" else 0
                
                work_lbl = st.selectbox("Work Type", ["Government Job", "Never Worked", "Private", "Self-employed", "Children"], index=2)
                work_map = {"Government Job": 0, "Never Worked": 1, "Private": 2, "Self-employed": 3, "Children": 4}
                inputs['work_type'] = work_map[work_lbl]
                
                residence_lbl = st.selectbox("Residence Area Type", ["Rural", "Urban"], index=1)
                inputs['Residence_type'] = 1 if residence_lbl == "Urban" else 0
                
                inputs['avg_glucose_level'] = st.slider("Average Glucose Level (mg/dl)", 50.0, 300.0, 91.88, 0.1)
                inputs['bmi'] = st.slider("Body Mass Index (BMI)", 10.0, 90.0, 28.1, 0.1)
                
                smoking_lbl = st.selectbox("Smoking Status", ["Unknown", "formerly smoked", "never smoked", "smokes"], index=2)
                smoking_map = {"Unknown": 0, "formerly smoked": 1, "never smoked": 2, "smokes": 3}
                inputs['smoking_status'] = smoking_map[smoking_lbl]
                
            submitted = st.form_submit_button("Generate Prediction Diagnostic")
            
    with col_r:
        st.markdown("### Risk Analysis Output")
        
        if submitted:
            # Map input parameters in correct column order
            input_df = pd.DataFrame([inputs], columns=columns)
            
            # Predict
            prob = model.predict_proba(input_df)[0, 1]
            
            # Risk categorization
            if prob < 0.35:
                risk_level = "Low"
                risk_class = "risk-low"
                gauge_color = "#2ed573"
            elif prob < 0.70:
                risk_level = "Moderate"
                risk_class = "risk-moderate"
                gauge_color = "#ff9f1a"
            else:
                risk_level = "High"
                risk_class = "risk-high"
                gauge_color = "#ff4d4d"
                
            # Store in session state
            p_record = {
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "patient_name": patient_name,
                "patient_id": patient_id,
                "disease": d_name.capitalize(),
                "probability": float(prob),
                "risk_level": risk_level,
                "inputs": inputs,
                "features": columns
            }
            st.session_state.predictions.append(p_record)
            
            st.markdown(f"""
            <div class='metric-card' style='text-align: center; border-color: {gauge_color};'>
                <div class='metric-title'>Diagnostics Classification Result</div>
                <div class='metric-value' style='color: {gauge_color}; text-shadow: 0 0 10px {gauge_color}33;'>{risk_level} Risk</div>
                <div style='font-size: 2.5rem; font-weight: 800; margin: 10px 0; color: #fff;'>{prob*100:.1f}%</div>
                <div style='color: #8f94a6; font-size: 0.85rem;'>Risk probability calculated for Patient: <b>{patient_name}</b> ({patient_id})</div>
            </div>
            """, unsafe_allow_html=True)
            
            # Real-time circular risk gauge
            fig_gauge = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = prob * 100,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Calculated Risk Score (%)", 'font': {'color': "#8f94a6", 'size': 14}},
                gauge = {
                    'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#8f94a6"},
                    'bar': {'color': gauge_color},
                    'bgcolor': "rgba(18, 20, 32, 0.5)",
                    'borderwidth': 1,
                    'bordercolor': "rgba(255, 255, 255, 0.1)",
                    'steps': [
                        {'range': [0, 35], 'color': 'rgba(46, 213, 115, 0.15)'},
                        {'range': [35, 70], 'color': 'rgba(255, 159, 26, 0.15)'},
                        {'range': [70, 100], 'color': 'rgba(255, 77, 77, 0.15)'}
                    ]
                }
            ))
            fig_gauge.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#e2e8f0'),
                height=220,
                margin=dict(l=20, r=20, t=40, b=10)
            )
            st.plotly_chart(fig_gauge, use_container_width=True)
            
            # Interactive local explanation (SHAP Contributions)
            st.markdown("### 🔍 Local Feature Contributions (SHAP)")
            shap_contribs = get_shap_contributions(explainer, input_df)
            
            shap_df = pd.DataFrame({
                'Feature': columns,
                'SHAP Value': shap_contribs,
                'Value': [inputs[col] if col in inputs else input_df[col].iloc[0] for col in columns]
            })
            # Format feature names
            shap_df['Feature Name'] = shap_df['Feature'] + " (" + shap_df['Value'].astype(str) + ")"
            shap_df = shap_df.sort_values(by='SHAP Value', key=abs, ascending=True)
            
            colors = ['#ff4d4d' if val >= 0 else '#2ed573' for val in shap_df['SHAP Value']]
            
            fig_shap = go.Figure(go.Bar(
                y=shap_df['Feature Name'],
                x=shap_df['SHAP Value'],
                orientation='h',
                marker_color=colors
            ))
            fig_shap.update_layout(
                title={'text': "Impact on Risk Probability<br>(Red: Increases Risk | Green: Reduces Risk)", 'font': {'size': 12, 'color': '#8f94a6'}},
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='#e2e8f0'),
                margin=dict(l=10, r=10, t=40, b=10),
                height=300,
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)')
            )
            st.plotly_chart(fig_shap, use_container_width=True)
            
            st.success("Analysis complete! Key risk factors identified. You can review detailed recommendations in the Recommendations tab or download a PDF in the Report Generator.")
        else:
            st.info("Enter details on the left and submit to compute clinical predictive risk classification.")

# ------------------------------------------------------------
# EXPLAINABLE AI PAGE
# ------------------------------------------------------------
elif page == "Explainable AI (SHAP)":
    st.markdown("<div class='section-header'>🔍 Explainable AI (SHAP Interpretability)</div>", unsafe_allow_html=True)
    st.markdown("Transparency is critical in medical AI models. We implement **SHAP (SHapley Additive exPlanations)** to establish global model accountability and local clinical logic validation.")
    
    eai_disease = st.selectbox("Select Disease Diagnostics Model for SHAP Explanations", ["diabetes", "heart", "liver", "stroke"])
    
    try:
        model, columns, X_train, explainer = load_model_components(eai_disease)
        shap_values = joblib.load(f'shap_files/{eai_disease}_shap_values.joblib')
        X_test = joblib.load(f'shap_files/{eai_disease}_X_test.joblib')
    except FileNotFoundError:
        st.error(f"SHAP pre-computed components for **{eai_disease}** not found. Run model training `train_models.py` first.")
        st.stop()
        
    tab1, tab2 = st.tabs(["📊 Global Feature Importance", "🐝 SHAP Beeswarm Plot"])
    
    with tab1:
        st.markdown("### Interactive Global Feature Importance (Plotly)")
        st.markdown("Calculated based on the **mean absolute SHAP value** across the entire validation cohort. Shows which features have the strongest overall impact on risk classification.")
        
        # Calculate mean absolute SHAP
        if isinstance(shap_values, list):
            # Binary classifier list style
            s_vals = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            s_vals = shap_values[:, :, 1]
        else:
            s_vals = shap_values
            
        mean_abs_shap = np.mean(np.abs(s_vals), axis=0)
        
        imp_df = pd.DataFrame({
            'Feature': columns,
            'Mean Absolute SHAP (Impact)': mean_abs_shap
        }).sort_values(by='Mean Absolute SHAP (Impact)', ascending=True)
        
        fig_global = go.Figure(go.Bar(
            y=imp_df['Feature'],
            x=imp_df['Mean Absolute SHAP (Impact)'],
            orientation='h',
            marker_color='#00f0ff'
        ))
        fig_global.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#e2e8f0'),
            xaxis=dict(title="Mean Absolute SHAP Value", gridcolor='rgba(255,255,255,0.05)'),
            yaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
            height=400,
            margin=dict(l=10, r=10, t=10, b=10)
        )
        st.plotly_chart(fig_global, use_container_width=True)
        
    with tab2:
        st.markdown("### Standard SHAP Beeswarm Summary Plot (Matplotlib)")
        st.markdown("The SHAP beeswarm plot shows the **directionality** of feature impact. Each dot is a patient test instance. Feature values are colored (red represents high feature values, blue represents low feature values). A positive SHAP value indicates that high levels of that feature increase disease risk classification.")
        
        fig, ax = plt.subplots(figsize=(10, 6))
        # Clear color background for Streamlit dark theme consistency
        fig.patch.set_facecolor('#0a0b10')
        ax.set_facecolor('#0a0b10')
        ax.spines['bottom'].set_color('#8f94a6')
        ax.spines['left'].set_color('#8f94a6')
        ax.tick_params(axis='x', colors='#8f94a6')
        ax.tick_params(axis='y', colors='#8f94a6')
        ax.xaxis.label.set_color('#8f94a6')
        ax.yaxis.label.set_color('#8f94a6')
        
        if isinstance(shap_values, list):
            shap.summary_plot(shap_values[1], X_test, show=False, plot_size=None)
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            shap.summary_plot(shap_values[:, :, 1], X_test, show=False, plot_size=None)
        else:
            shap.summary_plot(shap_values, X_test, show=False, plot_size=None)
            
        plt.tight_layout()
        st.pyplot(fig)

# ------------------------------------------------------------
# ANALYTICS & INSIGHTS PAGE
# ------------------------------------------------------------
elif page == "Analytics & Insights":
    st.markdown("<div class='section-header'>📊 Clinical Cohort Analytics & Trends</div>", unsafe_allow_html=True)
    st.markdown("In-depth analytical review of clinical datasets, cross-disease correlations, and simulated hospital screening trends.")
    
    tab_insights, tab_factors, tab_trends = st.tabs(["🔬 Cohort Insights", "⚡ Key Risk Factor Matrices", "📈 Screening Volume Trends"])
    
    with tab_insights:
        st.markdown("### Clinical Feature Distributions")
        ana_disease = st.selectbox("Select Screening Dataset to Analyze", ["diabetes", "heart", "liver", "stroke"])
        
        # Load dataset
        try:
            df_ana = pd.read_csv(f'data/{ana_disease}.csv', encoding='utf-8-sig')
        except FileNotFoundError:
            st.error(f"Dataset for {ana_disease} not found in `data/` directory.")
            st.stop()
            
        col_dist1, col_dist2 = st.columns(2)
        
        with col_dist1:
            st.markdown("#### Patient Cohort Age Distribution")
            # Set target column name
            t_col = 'Outcome' if 'Outcome' in df_ana.columns else ('target' if 'target' in df_ana.columns else ('Dataset' if 'Dataset' in df_ana.columns else 'stroke'))
            
            # Age histogram
            age_col = 'Age' if 'Age' in df_ana.columns else 'age'
            if age_col in df_ana.columns:
                df_ana_plot = df_ana.copy()
                if t_col == 'Dataset':
                    df_ana_plot['Diagnosis'] = df_ana_plot[t_col].map({1: "Positive", 2: "Negative"})
                else:
                    df_ana_plot['Diagnosis'] = df_ana_plot[t_col].map({1: "Positive", 0: "Negative"})
                    
                fig_hist = px.histogram(
                    df_ana_plot,
                    x=age_col,
                    color="Diagnosis",
                    barmode="overlay",
                    color_discrete_map={"Positive": "#ff4d4d", "Negative": "#2ed573"},
                    opacity=0.6
                )
                fig_hist.update_layout(
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='#e2e8f0'),
                    xaxis=dict(title="Age (Years)", gridcolor='rgba(255,255,255,0.05)'),
                    yaxis=dict(title="Count", gridcolor='rgba(255,255,255,0.05)')
                )
                st.plotly_chart(fig_hist, use_container_width=True)
            else:
                st.info("Age column not found in this dataset.")
                
        with col_dist2:
            st.markdown("#### Clinical Feature Correlation Map (Matplotlib)")
            # Numeric columns
            numeric_cols = df_ana.select_dtypes(include=[np.number]).columns.tolist()
            # Filter columns with low variance
            corr = df_ana[numeric_cols].corr()
            
            fig_corr, ax_corr = plt.subplots(figsize=(6, 4.5))
            fig_corr.patch.set_facecolor('#0a0b10')
            ax_corr.set_facecolor('#0a0b10')
            
            sns.heatmap(
                corr,
                annot=False,
                cmap="coolwarm",
                ax=ax_corr,
                cbar=True
            )
            ax_corr.tick_params(colors='#8f94a6', labelsize=8)
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            st.pyplot(fig_corr)
            
    with tab_factors:
        st.markdown("### Cross-Disease Risk Factor Synthesis")
        st.markdown("Synthetic summary matrix showing which clinical indicators are active predictors across multiple pathological categories.")
        
        # Matrix matching primary risk factors across domains
        cross_df = pd.DataFrame({
            "Risk Indicator": ["Age (Seniority)", "Systolic/Diastolic BP", "BMI (Obesity)", "Glucose (Hyperglycemia)", "Cholesterol", "Smoking Status"],
            "Diabetes Diagnostic": ["Moderate (SHAP Rank 3)", "Moderate (SHAP Rank 5)", "High (SHAP Rank 2)", "Critical (SHAP Rank 1)", "N/A", "N/A"],
            "Heart Disease": ["High (SHAP Rank 2)", "Moderate (SHAP Rank 4)", "N/A", "N/A", "Moderate (SHAP Rank 5)", "N/A"],
            "Liver Disease": ["Moderate (SHAP Rank 4)", "N/A", "N/A", "N/A", "N/A", "N/A"],
            "Stroke Predictor": ["Critical (SHAP Rank 1)", "Moderate (SHAP Rank 4)", "Low (SHAP Rank 6)", "High (SHAP Rank 2)", "N/A", "Moderate (SHAP Rank 5)"]
        })
        st.table(cross_df)
        
    with tab_trends:
        st.markdown("### simulated Hospital Screenings & Risk Trends")
        st.markdown("Monthly aggregation tracking screening caseloads and positive detection ratios in the clinical workflow.")
        
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        screenings = [280, 310, 350, 420, 390, 410, 450, 480, 520, 500, 580, 640]
        detected_cases = [45, 48, 54, 72, 63, 68, 75, 88, 102, 95, 115, 134]
        
        fig_trend = go.Figure()
        fig_trend.add_trace(go.Scatter(
            x=months,
            y=screenings,
            mode='lines+markers',
            name='Total Screened Patients',
            line=dict(color='#00f0ff', width=3),
            marker=dict(size=6)
        ))
        fig_trend.add_trace(go.Scatter(
            x=months,
            y=detected_cases,
            mode='lines+markers',
            name='High Risk Detected Cases',
            line=dict(color='#ff4d4d', width=3),
            marker=dict(size=6)
        ))
        fig_trend.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='#e2e8f0'),
            xaxis=dict(title="Month", gridcolor='rgba(255,255,255,0.05)'),
            yaxis=dict(title="Cases", gridcolor='rgba(255,255,255,0.05)'),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_trend, use_container_width=True)

# ------------------------------------------------------------
# RECOMMENDATIONS SYSTEM PAGE
# ------------------------------------------------------------
elif page == "Recommendations System":
    st.markdown("<div class='section-header'>💡 Personalized Clinical Recommendations</div>", unsafe_allow_html=True)
    st.markdown("Clinical support recommendations synthesized dynamically based on patient diagnostic risk profiles.")
    
    # Recommendation Database
    rec_database = {
        "Diabetes": {
            "High": {
                "medical": ["Urgent consultation with an endocrinologist.", "Schedule oral glucose tolerance test (OGTT) and HbA1c review.", "Daily blood glucose tracking required (pre and post-meals)."],
                "diet": ["Strict low-glycemic index (GI) foods.", "Eliminate processed sugars and simple carbohydrates.", "Integrate lean proteins and high-fiber cruciferous vegetables."],
                "exercise": ["Moderate activity: 30 minutes of brisk walking 5 days/week.", "Incorporate light resistance training twice a week to improve insulin sensitivity."],
                "lifestyle": ["Establish consistent sleep cycles (7-8 hours).", "Track daily hydration levels (minimum 2.5L water)."]
            },
            "Moderate": {
                "medical": ["Schedule a routine clinical evaluation.", "Monitor fasting blood glucose bi-weekly."],
                "diet": ["Limit simple sugars and processed carbs.", "Increase dietary fiber intake (whole grains, beans)."],
                "exercise": ["Aim for 150 minutes of moderate aerobic activity weekly."],
                "lifestyle": ["Monitor stress levels; practice mindfulness.", "Track weight and maintain a normal target BMI."]
            },
            "Low": {
                "medical": ["Annual baseline wellness screening recommended."],
                "diet": ["Maintain a balanced, whole-food diet rich in fiber and lean proteins."],
                "exercise": ["Incorporate standard regular physical activity (walking, cycling)."],
                "lifestyle": ["Prioritize quality sleep and daily stress management."]
            }
        },
        "Heart": {
            "High": {
                "medical": ["Urgent cardiology consultation required.", "Schedule resting ECG and echocardiogram.", "Implement daily blood pressure and heart rate logging."],
                "diet": ["Strict cardiac DASH diet: low sodium (<1500mg/day).", "Eliminate trans-fats and saturated lipid sources.", "Incorporate omega-3 rich foods (salmon, chia seeds)."],
                "exercise": ["Perform light aerobic training ONLY under medical clearance.", "Avoid sudden heavy weightlifting or high-intensity threshold cardio."],
                "lifestyle": ["Immediate complete smoking cessation.", "Limit caffeine intake and eliminate alcohol consumption."]
            },
            "Moderate": {
                "medical": ["Consult a primary clinician for blood pressure and lipid panel reviews."],
                "diet": ["Adopt DASH-diet principles: reduce sodium, limit red meat."],
                "exercise": ["Engage in 30 minutes of moderate cardio (cycling, swimming) 4 days/week."],
                "lifestyle": ["Manage workspace stress.", "Verify lipid and blood pressure scores monthly."]
            },
            "Low": {
                "medical": ["Standard periodic checkup including lipid profiles."],
                "diet": ["Maintain a heart-healthy diet focusing on plant oils, fish, and legumes."],
                "exercise": ["Maintain routine cardiovascular fitness (running, active sports)."],
                "lifestyle": ["Maintain healthy sleep cycles."]
            }
        },
        "Liver": {
            "High": {
                "medical": ["Immediate gastroenterologist/hepatologist evaluation.", "Schedule liver ultrasound and complete liver function panel (LFT).", "Review and adjust hepatotoxic prescription medications."],
                "diet": ["High protein, low-sodium diet (if hepatic encephalopathy is absent).", "Strictly eliminate processed sugars and fructose syrup.", "Increase cruciferous vegetables and daily intake of black coffee (proven hepatoprotective)."],
                "exercise": ["Engage in regular low-impact conditioning exercises (swimming, yoga)."],
                "lifestyle": ["Absolute complete avoidance of alcohol.", "Avoid over-the-counter pain medications containing paracetamol/acetaminophen."]
            },
            "Moderate": {
                "medical": ["Consult a general practitioner for LFT panel tracking in 3 months."],
                "diet": ["Limit saturated fats, fried foods, and simple carbohydrates."],
                "exercise": ["Participate in moderate training (brisk walking, light weights) to manage fatty liver risks."],
                "lifestyle": ["Minimize alcohol consumption strictly.", "Maintain structural healthy weight goals."]
            },
            "Low": {
                "medical": ["Routine baseline LFT screening during annual physicals."],
                "diet": ["Focus on a balanced Mediterranean-style diet."],
                "exercise": ["Maintain physical activity to sustain overall metabolic health."],
                "lifestyle": ["Avoid toxic chemical exposures and stay hydrated."]
            }
        },
        "Stroke": {
            "High": {
                "medical": ["Urgent clinical stroke risk assessment (neurological review).", "Aggressively manage and monitor blood pressure (<120/80 target).", "Consult clinician regarding antiplatelet or anticoagulant therapy if indicated."],
                "diet": ["Strict low-sodium, heart-healthy DASH dietary guidelines.", "Incorporate potassium-rich foods (bananas, spinach) to support vascular tone."],
                "exercise": ["Implement light low-impact cardiovascular training (brisk walking, indoor bike).", "Avoid high-strain isometric exercises that trigger acute blood pressure spikes."],
                "lifestyle": ["Strict immediate smoking and vaping cessation.", "Conduct immediate cognitive evaluation if warning signs (FAST) appear."]
            },
            "Moderate": {
                "medical": ["Review blood pressure, blood glucose, and cholesterol metrics with a clinician."],
                "diet": ["Reduce intake of saturated fats and high-sodium meals."],
                "exercise": ["Strive for 150 minutes of moderate cardiovascular workout every week."],
                "lifestyle": ["Log blood pressure levels bi-weekly.", "Reduce daily stress and alcohol consumption."]
            },
            "Low": {
                "medical": ["Regular annual checkups to evaluate baseline vascular biomarkers."],
                "diet": ["Incorporate vascular-supporting foods (fruits, whole grains, nuts)."],
                "exercise": ["Maintain active lifestyle with regular aerobic conditioning."],
                "lifestyle": ["Track stress and prioritize consistent sleep."]
            }
        }
    }
    
    # Check for latest prediction in session state
    if st.session_state.predictions:
        latest = st.session_state.predictions[-1]
        active_disease = latest['disease'] # 'Diabetes', 'Heart', etc.
        active_risk = latest['risk_level'] # 'Low', 'Moderate', 'High'
        
        st.success(f"Loaded latest diagnostic profile: **{latest['patient_name']}** ({latest['disease']} — **{latest['risk_level']} Risk**)")
    else:
        st.info("No active diagnostic screenings in the current session. Choose a clinical baseline to explore sample recommendations:")
        sel_col1, sel_col2 = st.columns(2)
        with sel_col1:
            active_disease = st.selectbox("Disease Profile", ["Diabetes", "Heart", "Liver", "Stroke"])
        with sel_col2:
            active_risk = st.selectbox("Risk Classification Level", ["High", "Moderate", "Low"])
            
    # Retrieve recommendations
    recs = rec_database[active_disease][active_risk]
    
    priority_badges = {
        "High": ("🚨 CRITICAL PRIORITY ACTIONS", "#ff4d4d"),
        "Moderate": ("⚠️ HIGH PRIORITY ACTIONS", "#ff9f1a"),
        "Low": ("✅ GENERAL MAINTENANCE GUIDELINES", "#2ed573")
    }
    badge_text, badge_color = priority_badges[active_risk]
    
    st.markdown(f"""
    <div style='background: rgba(18, 20, 32, 0.4); border-left: 5px solid {badge_color}; padding: 15px; border-radius: 6px; margin-bottom: 20px;'>
        <h4 style='color: {badge_color}; margin: 0;'>{badge_text}</h4>
        <p style='color: #8f94a6; font-size: 0.85rem; margin-top: 5px; margin-bottom: 0;'>Personalized advice synthesized for a <b>{active_risk} Risk</b> prediction model classification for <b>{active_disease}</b>.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_rec1, col_rec2 = st.columns(2)
    
    with col_rec1:
        with st.container():
            st.markdown("#### 🩺 Clinical & Medical Management")
            for item in recs['medical']:
                st.markdown(f"- {item}")
                
        with st.container():
            st.markdown("#### 🍏 Dietary Guidelines")
            for item in recs['diet']:
                st.markdown(f"- {item}")
                
    with col_rec2:
        with st.container():
            st.markdown("#### 🏃‍♂️ Physical Activity & Exercise")
            for item in recs['exercise']:
                st.markdown(f"- {item}")
                
        with st.container():
            st.markdown("#### 💤 Lifestyle & Daily Monitoring")
            for item in recs['lifestyle']:
                st.markdown(f"- {item}")

# ------------------------------------------------------------
# CLINICAL REPORT GENERATOR PAGE
# ------------------------------------------------------------
elif page == "Clinical Report Generator":
    st.markdown("<div class='section-header'>📋 Export Diagnostic EMR Report</div>", unsafe_allow_html=True)
    st.markdown("Compile a professional medical PDF report aggregating diagnostic classifications, clinical values, key risk factors (SHAP explanations), and action guidelines.")
    
    if not st.session_state.predictions:
        st.warning("No screenings performed yet in this session. Execute at least one disease predictor form diagnostic to compile and export a clinical report.")
        st.stop()
        
    st.markdown("### 1. Patient EMR & Clinician Meta Info")
    col_rep1, col_rep2 = st.columns(2)
    with col_rep1:
        rep_patient_name = st.text_input("Report Patient Name", value=st.session_state.predictions[-1]['patient_name'])
        rep_patient_id = st.text_input("Patient ID/EMR Number", value=st.session_state.predictions[-1]['patient_id'])
        rep_patient_age = st.number_input("Patient Age", min_value=1, max_value=120, value=45)
    with col_rep2:
        rep_clinician = st.text_input("Supervising Medical Clinician", value="Dr. Sarah Carter, MD")
        rep_date = st.date_input("Clinical Assessment Date", value=datetime.date.today())
        rep_notes = st.text_area("Clinical Case Diagnostics Notes", value="Screening profile requested for diagnostic validation.")
        
    st.markdown("### 2. Select Screenings to Include in Report")
    
    selected_preds = []
    for idx, p in enumerate(st.session_state.predictions):
        inc = st.checkbox(
            f"Include Screening: {p['disease']} Diagnostics ({p['timestamp']}) — Risk: {p['risk_level']} ({p['probability']*100:.1f}%)",
            value=True,
            key=f"rep_check_{idx}"
        )
        if inc:
            selected_preds.append(p)
            
    if not selected_preds:
        st.error("Please select at least one screening prediction profile to generate the report.")
        st.stop()
        
    # PDF generation trigger
    if st.button("Generate & Compile Clinical EMR PDF"):
        # FPDF custom class definition
        class ClinicalPDF(FPDF):
            def header(self):
                # Branding
                self.set_font("Helvetica", "B", 14)
                self.set_text_color(0, 102, 204) # Deep Clinical Blue
                self.cell(0, 10, "AI HEALTHCARE CLINICAL ANALYTICS PLATFORM", border=False, ln=True, align="L")
                
                self.set_font("Helvetica", "", 9)
                self.set_text_color(100, 100, 100)
                self.cell(0, 5, "EXPLAINABLE CLINICAL DECISION SUPPORT REPORT", border=False, ln=True, align="L")
                
                # Rule divider line
                self.set_draw_color(0, 102, 204)
                self.set_line_width(0.5)
                self.line(10, 25, 200, 25)
                self.ln(10)
                
            def footer(self):
                self.set_y(-20)
                self.set_draw_color(200, 200, 200)
                self.set_line_width(0.3)
                self.line(10, self.get_y(), 200, self.get_y())
                self.ln(2)
                
                self.set_font("Helvetica", "I", 8)
                self.set_text_color(128, 128, 128)
                self.cell(0, 5, "Confidential — Intended for Licensed Clinical Practitioner Use Only", align="L")
                self.cell(0, 5, f"Page {self.page_no()}/{{nb}}", align="R")

        pdf = ClinicalPDF()
        pdf.alias_nb_pages()
        pdf.add_page()
        
        # 1. Patient Profile Table
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(51, 51, 51)
        pdf.cell(0, 8, "I. PATIENT & CLINICAL EVALUATION DETAILS", ln=True)
        pdf.ln(2)
        
        # Border box for patient info
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(240, 245, 250)
        
        # Grid variables
        info_x = pdf.get_x()
        info_y = pdf.get_y()
        
        pdf.cell(45, 7, "Patient Name:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(50, 7, f" {rep_patient_name}", border=1)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(45, 7, "EMR/Clinical ID:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(50, 7, f" {rep_patient_id}", border=1, ln=True)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(45, 7, "Age:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(50, 7, f" {int(rep_patient_age)} Years", border=1)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(45, 7, "Assessment Date:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(50, 7, f" {rep_date}", border=1, ln=True)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(45, 7, "Supervising Clinician:", border=1, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(145, 7, f" {rep_clinician}", border=1, ln=True)
        
        pdf.ln(5)
        
        # 2. Case notes
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(45, 6, "Clinical Case Notes:", ln=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5, rep_notes, border=1)
        
        pdf.ln(8)
        
        # 3. Diagnostic Classifications
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(51, 51, 51)
        pdf.cell(0, 8, "II. PREDICTIVE DIAGNOSTICS & SHAP RISK EVALUATIONS", ln=True)
        pdf.ln(2)
        
        for idx, p in enumerate(selected_preds):
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(0, 102, 204)
            pdf.cell(0, 6, f"Diagnostic Test {idx+1}: {p['disease']} Risk Profile", ln=True)
            
            # Risk details row
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(51, 51, 51)
            pdf.cell(40, 6, "Calculated Risk Score:", border=0)
            pdf.set_font("Helvetica", "", 9)
            pdf.cell(50, 6, f" {p['probability']*100:.1f}% Risk Probability", border=0)
            
            pdf.set_font("Helvetica", "B", 9)
            pdf.cell(40, 6, "Assigned Severity:", border=0)
            pdf.set_font("Helvetica", "B", 9)
            if p['risk_level'] == "High":
                pdf.set_text_color(204, 0, 0) # Red
            elif p['risk_level'] == "Moderate":
                pdf.set_text_color(204, 102, 0) # Orange
            else:
                pdf.set_text_color(0, 153, 76) # Green
            pdf.cell(50, 6, f" {p['risk_level']} Classification", border=0, ln=True)
            
            pdf.set_text_color(51, 51, 51)
            pdf.ln(2)
            
            # Sub-table with input variables
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_fill_color(245, 245, 245)
            pdf.cell(70, 5, "Clinical Indicator Variable", border=1, fill=True)
            pdf.cell(50, 5, "Observed Patient Value", border=1, fill=True, ln=True)
            
            pdf.set_font("Helvetica", "", 8)
            for k, val in p['inputs'].items():
                # Format standard key names nicely
                disp_k = k.replace("_", " ").title()
                pdf.cell(70, 5, f" {disp_k}", border=1)
                pdf.cell(50, 5, f" {val}", border=1, ln=True)
                
            pdf.ln(5)
            
        pdf.ln(5)
        
        # 4. Clinical Disclaimer
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(204, 0, 0)
        pdf.cell(0, 6, "III. RIGOROUS MEDICAL CLINICAL DISCLAIMER", ln=True)
        pdf.ln(1)
        pdf.set_font("Helvetica", "I", 8.5)
        pdf.set_text_color(100, 100, 100)
        disclaimer_text = (
            "This diagnostic evaluation report is compiled utilizing machine learning algorithms trained on historic clinical "
            "reference datasets. All evaluations and mathematical assessments generated by this system are designed to serve "
            "strictly as analytical decision support tools for licensed physicians and practitioners. They DO NOT serve "
            "as absolute diagnostics or replacements for professional clinical judgment, bedside physical evaluation, or direct "
            "laboratory verification. The final assessment remains the complete, legal responsibility of the supervising "
            "medical professional."
        )
        pdf.multi_cell(0, 5, disclaimer_text, border=1)
        
        # Generate Bytes
        pdf_bytes = pdf.output()
        
        st.markdown("### Report Compiled Successfully!")
        st.success("Your printable clinical report has been compiled and is ready for local storage or print routing.")
        st.download_button(
            label="💾 Download EMR Diagnostics PDF Report",
            data=bytes(pdf_bytes),
            file_name=f"clinical_analytics_report_{rep_patient_id}_{datetime.date.today()}.pdf",
            mime="application/pdf"
        )
