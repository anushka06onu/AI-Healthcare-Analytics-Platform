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

# Set Streamlit Page Config for a bespoke web application
st.set_page_config(
    page_title="AI Healthcare Analytics Platform",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ------------------------------------------------------------
# SESSION STATE & ROUTING INITIALIZATION
# ------------------------------------------------------------
if 'predictions' not in st.session_state:
    st.session_state.predictions = []

if 'page' not in st.session_state:
    st.session_state.page = "🔬 Patient Diagnostic Suite"

if 'light_mode' not in st.session_state:
    st.session_state.light_mode = False

if 'clinician_name' not in st.session_state:
    st.session_state.clinician_name = ""

# Active diagnostic evaluators defaults
for model_key, default_val in [('eval_diabetes', True), ('eval_heart', True), ('eval_liver', False), ('eval_stroke', False), ('eval_kidney', False)]:
    if model_key not in st.session_state:
        st.session_state[model_key] = default_val

# ------------------------------------------------------------
# DYNAMIC THEME SYSTEM SELECTOR
# ------------------------------------------------------------
with st.sidebar:
    st.markdown("<h3 style='text-align: center; font-size: 1.05rem; margin-bottom: 5px; font-weight: 800;'>🎨 CLINI-SHAP THEME</h3>", unsafe_allow_html=True)
    light_mode = st.toggle("☀️ Light Mode / 🌙 Dark Mode", value=st.session_state.light_mode, key="light_mode_toggle")
    st.session_state.light_mode = light_mode
    st.markdown("<hr style='margin: 10px 0; opacity: 0.15;'>", unsafe_allow_html=True)

# Select CSS Variables based on current active theme
if st.session_state.light_mode: # Light Mode (Sky Blue Accents)
    bg_color = "#f4f6fa"
    text_color = "#0f172a"
    sidebar_bg = "#ffffff"
    card_bg = "#ffffff"
    card_border = "#e2e8f0"
    primary_color = "#0284c7"
    secondary_color = "#7c3aed"
    text_muted = "#64748b"
    shadow_css = "box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);"
    hr_color = "#e2e8f0"
    plot_template = "plotly_white"
    plt_theme_color = "#475569"
    grid_color = "rgba(0, 0, 0, 0.05)"
else: # Dark Mode (Default Neon Cyan Accents)
    bg_color = "#08090f"
    text_color = "#f1f5f9"
    sidebar_bg = "#0c0d16"
    card_bg = "rgba(17, 20, 36, 0.7)"
    card_border = "rgba(0, 240, 255, 0.15)"
    primary_color = "#00f0ff"
    secondary_color = "#c084fc"
    text_muted = "#94a3b8"
    shadow_css = "box-shadow: 0 4px 30px rgba(0, 0, 0, 0.45);"
    hr_color = "rgba(0, 240, 255, 0.15)"
    plot_template = "plotly_dark"
    plt_theme_color = "#94a3b8"
    grid_color = "rgba(255, 255, 255, 0.05)"

# Inject Custom Google Font and Custom EMR Theme Stylesheet
st.markdown(f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    
    /* Apply Font Globally */
    html, body, [class*="css"], .stApp, p, h1, h2, h3, h4, h5, h6, span, label, div, button {{
        font-family: 'Outfit', sans-serif !important;
    }}
    
    /* Style Streamlit Header to be transparent but allow collapse button click */
    [data-testid="stHeader"] {{
        background-color: transparent !important;
        visibility: visible !important;
    }}
    
    /* Hide Main Menu (three dots) and action items */
    [data-testid="stHeader"] > div:first-child, 
    [data-testid="stHeader"] #MainMenu, 
    [data-testid="stHeader"] .stActionButton {{
        visibility: hidden !important;
        display: none !important;
    }}
    
    /* Hide Default Streamlit footer */
    footer {{
        visibility: hidden !important;
        height: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
    }}
    
    /* Global Container Background and Text Styles */
    .stApp {{
        background-color: {bg_color} !important;
        color: {text_color} !important;
    }}
    
    /* Sidebar Navigation Container styling */
    [data-testid="stSidebar"] {{
        background-color: {sidebar_bg} !important;
        border-right: 1px solid {card_border} !important;
    }}
    
    /* Styled Premium Top Navbar */
    .emr-header-navbar {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: {card_bg};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid {card_border};
        border-bottom: 3px solid {primary_color};
        padding: 15px 25px;
        border-radius: 12px;
        margin-bottom: 25px;
        margin-top: -30px;
        {shadow_css}
    }}
    
    /* glowing pulse connection dot */
    .pulse-dot {{
        width: 8px;
        height: 8px;
        background-color: #2ed573;
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.7);
        animation: pulse-animation 1.6s infinite;
    }}
    
    @keyframes pulse-animation {{
        0% {{
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.7);
        }}
        70% {{
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(46, 213, 115, 0);
        }}
        100% {{
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(46, 213, 115, 0);
        }}
    }}
    
    /* Sidebar visual buttons overrides to render as drawer items */
    [data-testid="stSidebar"] button {{
        background-color: transparent !important;
        color: {text_muted} !important;
        border: 1px solid transparent !important;
        text-align: left !important;
        align-items: flex-start !important;
        justify-content: flex-start !important;
        padding: 10px 14px !important;
        border-radius: 8px !important;
        font-size: 0.85rem !important;
        font-weight: 500 !important;
        transition: all 0.22s ease-in-out !important;
        display: block !important;
        width: 100% !important;
        margin-bottom: 4px !important;
        box-shadow: none !important;
    }}
    
    [data-testid="stSidebar"] button:hover {{
        background-color: {primary_color}11 !important;
        border-color: {card_border} !important;
        color: {text_color} !important;
        transform: translateX(4px) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
    }}
    
    /* Styling clinical input forms & cards */
    [data-testid="stForm"] {{
        background: {card_bg} !important;
        border: 1px solid {card_border} !important;
        border-radius: 14px !important;
        padding: 22px !important;
        {shadow_css}
    }}
    
    /* Sub-containers & cards */
    .clinical-panel-card {{
        background: {card_bg};
        border: 1px solid {card_border};
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 18px;
        {shadow_css}
    }}
    
    .panel-card-title {{
        font-size: 0.95rem;
        font-weight: 700;
        color: {primary_color};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        border-bottom: 1px solid {card_border};
        padding-bottom: 6px;
    }}
    
    /* Styled metric panels */
    .metric-card {{
        background: {card_bg};
        border: 1px solid {card_border};
        border-radius: 12px;
        padding: 18px;
        margin: 8px 0px;
        {shadow_css}
        transition: transform 0.2s, border-color 0.2s;
    }}
    
    .metric-card:hover {{
        transform: translateY(-2px);
        border-color: {primary_color};
    }}
    
    .metric-title {{
        color: {text_muted};
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }}
    
    .metric-value {{
        color: {primary_color};
        font-size: 2.1rem;
        font-weight: 800;
        text-shadow: 0 0 10px {primary_color}25;
    }}
    
    .metric-sub {{
        color: {text_muted};
        font-size: 0.78rem;
        margin-top: 4px;
    }}
    .metric-sub span {{
        color: {primary_color};
        font-weight: bold;
    }}
    
    /* Section headers */
    .section-header {{
        font-size: 1.65rem;
        color: {text_color};
        font-weight: 800;
        margin-bottom: 18px;
        border-left: 5px solid {primary_color};
        padding-left: 14px;
    }}
    
    /* Styled EMR reference range badges */
    .ref-badge {{
        background-color: {bg_color};
        color: {text_muted};
        border: 1px solid {card_border};
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.72rem;
        font-weight: 600;
        display: inline-block;
        margin-top: 4px;
    }}
    
    /* Interactive disclaimer & footers */
    .clinical-footer {{
        background: {card_bg};
        border-top: 1px solid {card_border};
        padding: 15px;
        border-radius: 8px;
        margin-top: 45px;
        text-align: center;
        font-size: 0.78rem;
        color: {text_muted};
        {shadow_css}
    }}
    
    /* Custom style for primary submission button */
    div.stButton > button:first-child {{
        background-color: {primary_color} !important;
        color: #ffffff !important;
        border: none !important;
        padding: 10px 24px !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 14px {primary_color}40 !important;
        transition: all 0.2s ease !important;
    }}
    div.stButton > button:first-child:hover {{
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 18px {primary_color}60 !important;
    }}
</style>
""", unsafe_allow_html=True)

# ------------------------------------------------------------
# DRAWER SIDEBAR: ACTIVE DIAGNOSTICS & customizable profile
# ------------------------------------------------------------
with st.sidebar:
    # customizable Clinician Input Card
    st.markdown(f"""
    <div style='background: {card_bg}; padding: 14px; border-radius: 10px; border: 1px solid {card_border}; margin-bottom: 15px; {shadow_css}'>
        <div style='display: flex; align-items: center; gap: 10px;'>
            <div style='font-size: 1.6rem;'>🏬</div>
            <div>
                <div style='color: {text_color}; font-weight: 800; font-size: 0.88rem; letter-spacing: 0.3px;'>METRO HEALTH SYSTEM</div>
                <div style='color: {text_muted}; font-size: 0.72rem; font-weight: 600;'>Diagnostics Center</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown(f"<p style='color: {text_muted}; font-size: 0.72rem; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 5px;'>👨‍⚕️ Clinician Profile</p>", unsafe_allow_html=True)
    c_name_input = st.text_input("Active duty Clinician", value=st.session_state.clinician_name, placeholder="Enter Clinician Name...", key="clinician_name_input")
    st.session_state.clinician_name = c_name_input if c_name_input.strip() else "On-Duty Clinician"
    
    st.markdown("<hr style='margin: 10px 0; opacity: 0.15;'>", unsafe_allow_html=True)
    
    # Dynamic Diagnostic Model Toggles
    st.markdown(f"<p style='color: {text_muted}; font-size: 0.72rem; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 5px;'>⚙️ ACTIVE DIAGNOSTICS SUITE</p>", unsafe_allow_html=True)
    eval_diabetes = st.toggle("🍬 Diabetes Screening", value=st.session_state.eval_diabetes, key="eval_diabetes_toggle")
    eval_heart = st.toggle("❤️ Cardiovascular Screening", value=st.session_state.eval_heart, key="eval_heart_toggle")
    eval_liver = st.toggle("🧪 Liver Efficacy Evaluation", value=st.session_state.eval_liver, key="eval_liver_toggle")
    eval_stroke = st.toggle("🧠 Stroke Risk Screening", value=st.session_state.eval_stroke, key="eval_stroke_toggle")
    eval_kidney = st.toggle("🩸 Renal Kidney Diagnostic", value=st.session_state.eval_kidney, key="eval_kidney_toggle")
    
    st.session_state.eval_diabetes = eval_diabetes
    st.session_state.eval_heart = eval_heart
    st.session_state.eval_liver = eval_liver
    st.session_state.eval_stroke = eval_stroke
    st.session_state.eval_kidney = eval_kidney
    
    st.markdown("<hr style='margin: 10px 0; opacity: 0.15;'>", unsafe_allow_html=True)
    
    # Navigation Pages
    st.markdown(f"<p style='color: {text_muted}; font-size: 0.72rem; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 5px;'>🧭 Main Navigation</p>", unsafe_allow_html=True)
    nav_options = [
        ("🔬 Patient Diagnostic Suite", "Diagnostic Center"),
        ("🔍 Explainable AI (SHAP)", "Explainable AI"),
        ("📊 Cohort Insights & Trends", "Cohort Analytics"),
        ("💡 Personalized Care Advisor", "Care Advisor"),
        ("📋 Clinical EMR Report", "EMR Report")
    ]
    
    for display_name, internal_page in nav_options:
        is_active = st.session_state.page == display_name
        
        if is_active:
            st.markdown(f"""
            <style>
                div.row-widget.stButton button[key*="nav_btn_{internal_page}"] {{
                    background-color: {primary_color}18 !important;
                    border-left: 4px solid {primary_color} !important;
                    color: {text_color} !important;
                    font-weight: 700 !important;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.03) !important;
                    border-radius: 0px 8px 8px 0px !important;
                }}
            </style>
            """, unsafe_allow_html=True)
            
        if st.button(display_name, key=f"nav_btn_{internal_page}", use_container_width=True):
            st.session_state.page = display_name
            st.rerun()
            
    st.markdown("<hr style='margin: 12px 0; opacity: 0.15;'>", unsafe_allow_html=True)
    
    st.markdown(f"""
    <div style='background: {card_bg}; padding: 12px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.15); {shadow_css}'>
        <p style='color: #ef4444; font-size: 0.72rem; font-weight: bold; margin: 0; margin-bottom: 4px; text-transform: uppercase; display: flex; align-items: center; gap: 5px;'>⚠️ Disclaimer</p>
        <p style='color: {text_muted}; font-size: 0.68rem; margin: 0; line-height: 1.3;'>This CDSS is intended for educational research and diagnostics baseline testing only. Licensed validation required.</p>
    </div>
    """, unsafe_allow_html=True)

# ------------------------------------------------------------
# DYNAMIC CLINIC HEADER RENDER (customizable Clinician)
# ------------------------------------------------------------
st.markdown(f"""
<div class='emr-header-navbar' style='margin-top: -50px;'>
    <div style='display: flex; align-items: center; gap: 12px;'>
        <div style='font-size: 1.9rem;'>🏥</div>
        <div>
            <h2 style='color: {text_color}; margin: 0; font-weight: 800; font-size: 1.35rem; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 8px;'>
                CLINI-SHAP <span style='color: {primary_color}; font-size: 0.75rem; background: {primary_color}1a; border: 1px solid {primary_color}40; padding: 2px 8px; border-radius: 4px; font-weight: 700; letter-spacing: 0.5px;'>INTELLIGENT CDSS</span>
            </h2>
            <p style='color: {text_muted}; font-size: 0.78rem; margin: 0; margin-top: 2px; font-weight: 500;'>AI Clinical Decision Support Suite & Explainable Attributions</p>
        </div>
    </div>
    <div style='display: flex; align-items: center; gap: 20px;'>
        <div style='text-align: right; border-right: 1px solid {card_border}; padding-right: 15px;'>
            <div style='color: {text_muted}; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;'>Clinician Portal</div>
            <div style='color: {text_color}; font-size: 0.82rem; font-weight: 700;'>{st.session_state.clinician_name}</div>
        </div>
        <div style='display: flex; align-items: center; gap: 8px;'>
            <span class='pulse-dot'></span>
            <span style='color: {text_color}; font-size: 0.8rem; font-weight: 600;'>System Active</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------------------------------------------------
# MODEL & METRICS HELPER LOADERS
# ------------------------------------------------------------
@st.cache_data
def load_metrics():
    try:
        with open('models/model_metrics.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

@st.cache_resource
def load_model_components(disease_name):
    model = joblib.load(f'models/{disease_name}_model.pkl')
    scaler = joblib.load(f'models/{disease_name}_scaler.pkl')
    columns = list(scaler.feature_names_in_)
    X_train = joblib.load(f'models/{disease_name}_X_train.joblib')
    explainer = joblib.load(f'shap_files/{disease_name}_explainer.joblib')
    return model, scaler, columns, X_train, explainer

def get_shap_contributions(model, scaler, X_sample):
    cols = list(scaler.feature_names_in_)
    X_scaled = pd.DataFrame(scaler.transform(X_sample), columns=cols)
    
    model_class = model.__class__.__name__
    
    if "RandomForest" in model_class:
        explainer = shap.TreeExplainer(model)
        shap_val_raw = explainer.shap_values(X_scaled)
        
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
            vals = shap_val_raw
    else:
        baseline = pd.DataFrame(np.zeros((1, len(cols))), columns=cols)
        explainer = shap.KernelExplainer(model.predict_proba, baseline)
        shap_val_raw = explainer.shap_values(X_scaled)
        
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
            vals = shap_val_raw
            
    if len(np.shape(vals)) == 2:
        vals = vals[0]
    return vals

metrics = load_metrics()

# ------------------------------------------------------------
# ROUTING & PAGE CONTROLLERS
# ------------------------------------------------------------

# PAGE 1: COMBINED CLINICAL DIAGNOSTIC CENTER
if st.session_state.page == "🔬 Patient Diagnostic Suite":
    st.markdown("<div class='section-header'>🔬 Patient Diagnostics & Risk Evaluations</div>", unsafe_allow_html=True)
    st.markdown("Execute unified diagnostic evaluations by toggling specific models ON/OFF in the sidebar drawer.")
    
    # Verify at least one diagnostics screen is active
    active_evals = [st.session_state.eval_diabetes, st.session_state.eval_heart, st.session_state.eval_liver, st.session_state.eval_stroke, st.session_state.eval_kidney]
    if not any(active_evals):
        st.warning("⚠️ Active Diagnostics Suite Empty: Please turn ON at least one diagnostic model in the left sidebar drawer to render form inputs.")
        st.stop()
        
    st.markdown("### Clinical Diagnostics Panel")
    with st.form("clinical_diagnostics_suite"):
        # Section 1: Patient Profile & Identification (Purged of Dummy Data)
        st.markdown("<div class='panel-card-title'>👤 Patient Identification</div>", unsafe_allow_html=True)
        col_id1, col_id2 = st.columns(2)
        with col_id1:
            patient_name = st.text_input("Patient Full Name", value="", placeholder="Enter Patient Full Name...", help="Patient's legal identity.")
        with col_id2:
            patient_id = st.text_input("EMR Registry Number", value="", placeholder="Enter EMR ID (e.g., EMR-10023)...", help="Unique hospital database identifier.")
            
        # Section 2: Shared Vitals & Demographics
        st.markdown("<div class='panel-card-title'>🩺 Shared Patient Vitals</div>", unsafe_allow_html=True)
        col_sv1, col_sv2, col_sv3 = st.columns(3)
        with col_sv1:
            inputs_age = st.slider("Patient Age in Years", 1, 120, 45)
            inputs_sex_lbl = st.selectbox("Biological Sex", ["Female", "Male"], index=0)
            inputs_sex = 1 if inputs_sex_lbl == "Male" else 0
        with col_sv2:
            inputs_trestbps = st.slider("Resting Upper Blood Pressure (Systolic) in mm Hg", 80, 220, 120, help="Arterial blood pressure during heart contractions.")
            st.markdown("<span class='ref-badge'>Healthy Systolic BP: Under 120 mm Hg</span>", unsafe_allow_html=True)
            
            inputs_bp = st.slider("Resting Lower Blood Pressure (Diastolic) in mm Hg", 50, 180, 80, help="Arterial blood pressure between heart beats.")
            st.markdown("<span class='ref-badge'>Healthy Diastolic BP: Under 80 mm Hg</span>", unsafe_allow_html=True)
        with col_sv3:
            inputs_bmi = st.slider("Body Mass Index / Obesity Ratio (BMI)", 5.0, 90.0, 25.0, 0.1, help="Obesity index mapped from weight to height-squared.")
            st.markdown("<span class='ref-badge'>Healthy BMI: 18.5 - 24.9</span>", unsafe_allow_html=True)
            
            inputs_glucose = st.slider("Fasting Blood Sugar level (Glucose) in mg/dl", 20, 500, 100, help="Plasma glucose level tested upon admission or fasting.")
            st.markdown("<span class='ref-badge'>Healthy Fasting Sugar: Under 100 mg/dl</span>", unsafe_allow_html=True)
            
        # Section 3: Conditional Medical History & Lifestyle
        needs_history = st.session_state.eval_stroke or st.session_state.eval_kidney or st.session_state.eval_heart
        if needs_history:
            st.markdown("<div class='panel-card-title'>🏥 Medical Risk History & Lifestyle</div>", unsafe_allow_html=True)
            col_mh1, col_mh2, col_mh3 = st.columns(3)
            with col_mh1:
                hist_htn = st.selectbox("High Blood Pressure History (Hypertension)?", ["No", "Yes"], index=0)
                hist_dm = st.selectbox("Diabetes Diagnosis History?", ["No", "Yes"], index=0)
                hist_cad = st.selectbox("Coronary Artery Disease History?", ["No", "Yes"], index=0)
            with col_mh2:
                hist_pe = st.selectbox("Fluid Leg/Foot Swelling (Pedal Edema)?", ["No", "Yes"], index=0, help="Peripheral fluid retention indicative of cardiac/kidney decline.")
                hist_ane = st.selectbox("Anemia Diagnosis History?", ["No", "Yes"], index=0)
                hist_appet_lbl = st.selectbox("Patient Appetite Quality", ["Good Appetite", "Poor Appetite"], index=0)
                hist_appet = 0 if hist_appet_lbl == "Good Appetite" else 1
            with col_mh3:
                hist_married = st.selectbox("Ever Married?", ["No", "Yes"], index=1)
                hist_work_lbl = st.selectbox("Occupation / Work Type", ["Private Corporate Sector", "Government Employee", "Self-employed", "Student / Child", "Never Worked"], index=0)
                hist_work = {"Private Corporate Sector": 2, "Government Employee": 0, "Self-employed": 3, "Student / Child": 4, "Never Worked": 1}[hist_work_lbl]
                
                hist_residence = st.selectbox("Residence Location Area", ["Urban / City", "Rural / Countryside"], index=0)
                hist_residence_val = 1 if hist_residence == "Urban / City" else 0
                
                hist_smoke_lbl = st.selectbox("Smoking History Status", ["Never Smoked", "Formerly Smoked (Quit)", "Active Smoker", "Unknown / Not Disclosed"], index=0)
                hist_smoke = {"Never Smoked": 2, "Formerly Smoked (Quit)": 1, "Active Smoker": 3, "Unknown / Not Disclosed": 0}[hist_smoke_lbl]
        else:
            hist_htn, hist_dm, hist_cad, hist_pe, hist_ane, hist_appet, hist_married, hist_work, hist_residence_val, hist_smoke = "No", "No", "No", "No", "No", 0, "Yes", 2, 1, 2
            
        # Section 4: Specific Laboratory Panels
        inputs_dia, inputs_h, inputs_l, inputs_k = {}, {}, {}, {}
        
        # Diabetes Lab Fields
        if st.session_state.eval_diabetes:
            st.markdown("<div class='panel-card-title'>🧪 Diabetes Laboratory Parameters</div>", unsafe_allow_html=True)
            col_lab_dia1, col_lab_dia2 = st.columns(2)
            with col_lab_dia1:
                inputs_dia['Pregnancies'] = st.slider("Past Pregnancies Count", 0, 20, 0 if inputs_sex == 1 else 3, help="Only applicable to female patient demographics.")
                inputs_dia['SkinThickness'] = st.slider("Triceps Skin Fold Thickness in mm", 0, 100, 23, help="Used to map fat indicators.")
            with col_lab_dia2:
                inputs_dia['Insulin'] = st.slider("2-Hour Blood Insulin level in mu U/ml", 0, 900, 30, help="Blood insulin marker.")
                inputs_dia['DiabetesPedigreeFunction'] = st.slider("Family History Diabetes Risk Score", 0.0, 3.0, 0.37, 0.01, help="Calculated genetic pedigree database factor.")
                
        # Heart Lab Fields
        if st.session_state.eval_heart:
            st.markdown("<div class='panel-card-title'>🧪 Cardio Stress Laboratory Markers</div>", unsafe_allow_html=True)
            col_lab_h1, col_lab_h2 = st.columns(2)
            with col_lab_h1:
                inputs_h['chol'] = st.slider("Total Blood Cholesterol level in mg/dl", 100, 600, 240, help="Combined cholesterol count.")
                st.markdown("<span class='ref-badge'>Ideal Cholesterol: Under 200 mg/dl</span>", unsafe_allow_html=True)
                
                inputs_h['thalach'] = st.slider("Maximum Heart Rate Achieved (Pulse)", 50, 250, 153, help="Maximum pulse rate recorded during stress exercise.")
                
                inputs_h['oldpeak'] = st.slider("ECG ST Depression (Heart Stress oldpeak)", 0.0, 10.0, 0.8, 0.1, help="ECG waveform strain indicator. Higher maps active blockage risk.")
                st.markdown("<span class='ref-badge'>Normal oldpeak: Under 1.0</span>", unsafe_allow_html=True)
                
                inputs_h['ca'] = st.slider("Blocked Major Coronary Vessels Count", 0, 4, 0, help="Number of major heart arteries found blocked under fluoroscopy.")
                st.markdown("<span class='ref-badge'>Healthy Blocked: 0 vessels</span>", unsafe_allow_html=True)
            with col_lab_h2:
                inputs_h['cp'] = st.selectbox("Chest Pain Severity Type", ["Non-Anginal Muscle Pain", "Typical Heart Angina", "Atypical Non-Classic Pain", "No Chest Pain (Asymptomatic)"], index=0)
                inputs_h['cp_val'] = {"Non-Anginal Muscle Pain": 2, "Typical Heart Angina": 0, "Atypical Non-Classic Pain": 1, "No Chest Pain (Asymptomatic)": 3}[inputs_h['cp']]
                
                inputs_h['restecg'] = st.selectbox("Resting Electrocardiogram (ECG)", ["Normal ECG", "ST-T Wave Abnormality (Heart strain indicator)", "Left Ventricular Hypertrophy (Enlarged walls)"], index=0)
                inputs_h['restecg_val'] = {"Normal ECG": 0, "ST-T Wave Abnormality (Heart strain indicator)": 1, "Left Ventricular Hypertrophy (Enlarged walls)": 2}[inputs_h['restecg']]
                
                inputs_h['exang'] = st.selectbox("Physical Angina (Chest pain triggered by active exercise)?", ["No", "Yes"], index=0)
                inputs_h['exang_val'] = 1 if inputs_h['exang'] == "Yes" else 0
                
                inputs_h['slope'] = st.selectbox("Exercise Peak ST Segment Wave Slope", ["Flat Slope (Mild strain)", "Upsloping (Healthy response)", "Downsloping (Severe risk)"], index=0)
                inputs_h['slope_val'] = {"Flat Slope (Mild strain)": 1, "Upsloping (Healthy response)": 0, "Downsloping (Severe risk)": 2}[inputs_h['slope']]
                
                inputs_h['thal'] = st.selectbox("Thalassemia Blood Flow Scan Status", ["Fixed flow defect (Old muscle damage)", "Normal Scan", "Reversible defect (Active blockage risk)"], index=1)
                inputs_h['thal_val'] = {"Fixed flow defect (Old muscle damage)": 2, "Normal Scan": 1, "Reversible defect (Active blockage risk)": 3}[inputs_h['thal']]
                
        # Liver Lab Fields
        if st.session_state.eval_liver:
            st.markdown("<div class='panel-card-title'>🧪 Hepatic Enzymes & Protein Panel</div>", unsafe_allow_html=True)
            col_lab_l1, col_lab_l2 = st.columns(2)
            with col_lab_l1:
                inputs_l['Total_Bilirubin'] = st.slider("Total Bilirubin (Yellow Bile Pigment) in mg/dl", 0.1, 80.0, 1.0, 0.1, help="Bile waste pigment. High suggests blockage.")
                st.markdown("<span class='ref-badge'>Healthy Total Bilirubin: 0.1 - 1.2 mg/dl</span>", unsafe_allow_html=True)
                
                inputs_l['Direct_Bilirubin'] = st.slider("Direct Bilirubin (Processed Bile Pigment) in mg/dl", 0.1, 40.0, 0.3, 0.1, help="Processed bile waste. High maps hepatocyte injury.")
                st.markdown("<span class='ref-badge'>Healthy Direct Bilirubin: 0.0 - 0.3 mg/dl</span>", unsafe_allow_html=True)
                
                inputs_l['Alkaline_Phosphotase'] = st.slider("Liver Alkaline Phosphatase Enzyme (ALP) in IU/L", 10, 3000, 208, help="Hepatic enzyme. High indicates bile duct stress.")
                st.markdown("<span class='ref-badge'>Healthy ALP: 44 - 147 IU/L</span>", unsafe_allow_html=True)
                
                inputs_l['Alamine_Aminotransferase'] = st.slider("SGPT / ALT Liver Cell Irritation Enzyme in IU/L", 10, 2000, 35, help="Released directly into blood when liver cells are stressed.")
                st.markdown("<span class='ref-badge'>Healthy ALT: 7 - 56 IU/L</span>", unsafe_allow_html=True)
            with col_lab_l2:
                inputs_l['Aspartate_Aminotransferase'] = st.slider("SGOT / AST Liver/Heart Activity Enzyme in IU/L", 10, 5000, 42, help="Elevates under tissue damage.")
                st.markdown("<span class='ref-badge'>Healthy AST: 10 - 40 IU/L</span>", unsafe_allow_html=True)
                
                inputs_l['Total_Protiens'] = st.slider("Total Blood Proteins in g/dl", 2.0, 10.0, 6.6, 0.1, help="Combined proteins count.")
                st.markdown("<span class='ref-badge'>Healthy Proteins: 6.0 - 8.3 g/dl</span>", unsafe_allow_html=True)
                
                inputs_l['Albumin'] = st.slider("Albumin Protein level in g/dl", 0.9, 6.0, 3.1, 0.1, help="Key blood protein created exclusively by hepatocytes.")
                st.markdown("<span class='ref-badge'>Healthy Albumin: 3.5 - 5.0 g/dl</span>", unsafe_allow_html=True)
                
                inputs_l['Albumin_and_Globulin_Ratio'] = st.slider("Albumin and Globulin Protein Ratio", 0.1, 3.0, 0.93, 0.01, help="Low indicates chronic dysfunction.")
                st.markdown("<span class='ref-badge'>Healthy Ratio: 0.8 - 2.0</span>", unsafe_allow_html=True)
                
        # Kidney Lab Fields
        if st.session_state.eval_kidney:
            st.markdown("<div class='panel-card-title'>🧪 Renal Physical & Urinalysis Panel</div>", unsafe_allow_html=True)
            col_lab_k1, col_lab_k2 = st.columns(2)
            with col_lab_k1:
                inputs_k['sg'] = st.selectbox("Urine Concentration Density (Specific Gravity)", ["1.005", "1.010", "1.015", "1.020", "1.025"], index=3, help="Urine density; maps filtering capabilities.")
                inputs_k['sg_val'] = float(inputs_k['sg'])
                st.markdown("<span class='ref-badge'>Healthy sg: 1.010 - 1.025</span>", unsafe_allow_html=True)
                
                inputs_k['al'] = st.selectbox("Urine Protein level (Albumin Leakage)", ["0", "1", "2", "3", "4", "5"], index=1, help="Protein leakage in urine. 0 is normal.")
                inputs_k['al_val'] = int(inputs_k['al'])
                st.markdown("<span class='ref-badge'>Normal Albumin: 0 (No leakage)</span>", unsafe_allow_html=True)
                
                inputs_k['su'] = st.selectbox("Urine Sugar level (Glucose Leakage)", ["0", "1", "2", "3", "4", "5"], index=0, help="Sugar leakage in urine. 0 is normal.")
                inputs_k['su_val'] = int(inputs_k['su'])
                st.markdown("<span class='ref-badge'>Normal Sugar: 0 (No leakage)</span>", unsafe_allow_html=True)
                
                inputs_k['rbc'] = st.selectbox("Urine Red Blood Cells Status", ["Healthy / Clear (normal)", "Abnormal / Blood present (abnormal)"], index=0)
                inputs_k['rbc_val'] = 0 if inputs_k['rbc'] == "Healthy / Clear (normal)" else 1
            with col_lab_k2:
                inputs_k['pc'] = st.selectbox("Urine Pus Cells Status (White Cells)", ["Healthy / Clear (normal)", "Abnormal / Infection signs (abnormal)"], index=0)
                inputs_k['pc_val'] = 0 if inputs_k['pc'] == "Healthy / Clear (normal)" else 1
                
                inputs_k['pcc'] = st.selectbox("Urine Pus Cell Clumps presence", ["Not Present (healthy)", "Present (active infection)"], index=0)
                inputs_k['pcc_val'] = 0 if inputs_k['pcc'] == "Not Present (healthy)" else 1
                
                inputs_k['ba'] = st.selectbox("Urine Bacteria Presence", ["Not Present (healthy)", "Present (bacterial infection)"], index=0)
                inputs_k['ba_val'] = 0 if inputs_k['ba'] == "Not Present (healthy)" else 1
                
            st.markdown("<div class='panel-card-title'>🩸 Renal Blood Hematology Markers</div>", unsafe_allow_html=True)
            col_lab_k3, col_lab_k4 = st.columns(2)
            with col_lab_k3:
                inputs_k['bu'] = st.slider("Blood Urea level in mg/dl", 1, 400, 36, help="Renal nitrogen waste product.")
                st.markdown("<span class='ref-badge'>Healthy Blood Urea: 7 - 20 mg/dl</span>", unsafe_allow_html=True)
                
                inputs_k['sc'] = st.slider("Serum Creatinine level in mg/dl", 0.1, 40.0, 1.2, 0.1, help="Essential muscle waste product. Rises sharply as kidney filtration rates fall.")
                st.markdown("<span class='ref-badge'>Healthy Serum Creatinine: 0.6 - 1.2 mg/dl</span>", unsafe_allow_html=True)
                
                inputs_k['sod'] = st.slider("Blood Sodium level in mEq/L", 50, 180, 138, help="Blood sodium electrolyte.")
                st.markdown("<span class='ref-badge'>Healthy Blood Sodium: 135 - 145 mEq/L</span>", unsafe_allow_html=True)
                
                inputs_k['pot'] = st.slider("Blood Potassium level in mEq/L", 1.0, 45.0, 4.4, 0.1, help="Blood potassium electrolyte.")
                st.markdown("<span class='ref-badge'>Healthy Blood Potassium: 3.5 - 5.0 mEq/L</span>", unsafe_allow_html=True)
            with col_lab_k4:
                inputs_k['hemo'] = st.slider("Blood Hemoglobin level in gms", 3.0, 20.0, 12.5, 0.1, help="Oxygen-carrying protein.")
                st.markdown("<span class='ref-badge'>Healthy Hemoglobin: 12.0 - 17.5 g/dl</span>", unsafe_allow_html=True)
                
                inputs_k['pcv'] = st.slider("Hematocrit / Packed Cell Volume (PCV) in %", 5, 60, 40, help="Percentage of blood volume occupied by red blood cells. Low maps anemia.")
                st.markdown("<span class='ref-badge'>Healthy Hematocrit: 36% - 50%</span>", unsafe_allow_html=True)
                
                inputs_k['wbcc'] = st.slider("White Blood Cell Count in /cumm", 1000, 30000, 7800, 100, help="Immune cells count.")
                st.markdown("<span class='ref-badge'>Healthy WBC: 4,500 - 11,000 /cumm</span>", unsafe_allow_html=True)
                
                inputs_k['rbcc'] = st.slider("Red Blood Cell Count in millions/cmm", 1.0, 10.0, 4.8, 0.1, help="Total blood red cells.")
                st.markdown("<span class='ref-badge'>Healthy RBC: 4.0 - 5.9 million/cmm</span>", unsafe_allow_html=True)
                
        # Primary Action Button
        st.markdown("<div style='text-align: center; margin-top: 15px;'>", unsafe_allow_html=True)
        submitted = st.form_submit_button("Run EMR Diagnostics Suite")
        st.markdown("</div>", unsafe_allow_html=True)
        
    # Predictions Grid calculation
    if submitted:
        # Enforce validation checks on Patient metadata
        if not patient_name.strip() or not patient_id.strip():
            st.error("⚠️ Mandatory Patient Identification Required: Please enter the Patient Full Name and EMR Registry Number in the Profile Section before running diagnostic calculations.")
            st.stop()
            
        st.markdown("### Coordinated Risk Analysis Output")
        
        # Determine active models list
        active_list = []
        if st.session_state.eval_diabetes: active_list.append("diabetes")
        if st.session_state.eval_heart: active_list.append("heart")
        if st.session_state.eval_liver: active_list.append("liver")
        if st.session_state.eval_stroke: active_list.append("stroke")
        if st.session_state.eval_kidney: active_list.append("kidney")
        
        # Setup columns dynamically
        n_active = len(active_list)
        
        # Dynamic row layouts based on selected counts
        cols_grid = []
        if n_active == 1:
            cols_grid = [st.container()]
        elif n_active == 2:
            cols_grid = st.columns(2)
        elif n_active == 3:
            cols_grid = st.columns(3)
        elif n_active == 4:
            row1 = st.columns(2)
            row2 = st.columns(2)
            cols_grid = row1 + row2
        else:
            row1 = st.columns(3)
            row2 = st.columns(2)
            cols_grid = row1 + row2
            
        for i_col, name in enumerate(active_list):
            model, scaler, columns, X_train, explainer = load_model_components(name)
            
            # Map input parameters dynamically per model
            mapped_inputs = {}
            if name == "diabetes":
                mapped_inputs = {
                    'Pregnancies': inputs_dia['Pregnancies'],
                    'Glucose': inputs_glucose,
                    'BloodPressure': inputs_bp,
                    'SkinThickness': inputs_dia['SkinThickness'],
                    'Insulin': inputs_dia['Insulin'],
                    'BMI': inputs_bmi,
                    'DiabetesPedigreeFunction': inputs_dia['DiabetesPedigreeFunction'],
                    'Age': inputs_age
                }
            elif name == "heart":
                mapped_inputs = {
                    'age': inputs_age,
                    'sex': inputs_sex,
                    'cp': inputs_h['cp_val'],
                    'trestbps': inputs_trestbps,
                    'chol': inputs_h['chol'],
                    'fbs': 1 if inputs_glucose > 120 else 0,
                    'restecg': inputs_h['restecg_val'],
                    'thalach': inputs_h['thalach'],
                    'exang': inputs_h['exang_val'],
                    'oldpeak': inputs_h['oldpeak'],
                    'slope': inputs_h['slope_val'],
                    'ca': inputs_h['ca'],
                    'thal': inputs_h['thal_val']
                }
            elif name == "liver":
                mapped_inputs = {
                    'Age': inputs_age,
                    'Gender': inputs_sex,
                    'Total_Bilirubin': inputs_l['Total_Bilirubin'],
                    'Direct_Bilirubin': inputs_l['Direct_Bilirubin'],
                    'Alkaline_Phosphotase': inputs_l['Alkaline_Phosphotase'],
                    'Alamine_Aminotransferase': inputs_l['Alamine_Aminotransferase'],
                    'Aspartate_Aminotransferase': inputs_l['Aspartate_Aminotransferase'],
                    'Total_Protiens': inputs_l['Total_Protiens'],
                    'Albumin': inputs_l['Albumin'],
                    'Albumin_and_Globulin_Ratio': inputs_l['Albumin_and_Globulin_Ratio']
                }
            elif name == "stroke":
                mapped_inputs = {
                    'gender': inputs_sex,
                    'age': float(inputs_age),
                    'hypertension': 1 if hist_htn == "Yes" else 0,
                    'heart_disease': 1 if (hist_cad == "Yes" or hist_pe == "Yes") else 0,
                    'ever_married': 1 if hist_married == "Yes" else 0,
                    'work_type': hist_work,
                    'Residence_type': hist_residence_val,
                    'avg_glucose_level': float(inputs_glucose),
                    'bmi': float(inputs_bmi),
                    'smoking_status': hist_smoke
                }
            elif name == "kidney":
                mapped_inputs = {
                    'age': float(inputs_age), 'bp': float(inputs_bp), 'sg': inputs_k['sg_val'],
                    'al': inputs_k['al_val'], 'su': inputs_k['su_val'], 'rbc': inputs_k['rbc_val'],
                    'pc': inputs_k['pc_val'], 'pcc': inputs_k['pcc_val'], 'ba': inputs_k['ba_val'],
                    'bgr': float(inputs_glucose), 'bu': float(inputs_k['bu']), 'sc': float(inputs_k['sc']),
                    'sod': float(inputs_k['sod']), 'pot': float(inputs_k['pot']), 'hemo': float(inputs_k['hemo']),
                    'pcv': int(inputs_k['pcv']), 'wbcc': float(inputs_k['wbcc']), 'rbcc': float(inputs_k['rbcc']),
                    'htn': 1 if hist_htn == "Yes" else 0, 'dm': 1 if hist_dm == "Yes" else 0,
                    'cad': 1 if hist_cad == "Yes" else 0, 'appet': hist_appet, 'pe': 1 if hist_pe == "Yes" else 0,
                    'ane': 1 if hist_ane == "Yes" else 0
                }
                
            input_df = pd.DataFrame([mapped_inputs], columns=columns)
            input_scaled = pd.DataFrame(scaler.transform(input_df), columns=columns)
            prob = model.predict_proba(input_scaled)[0, 1]
            
            # Risk coloring
            if prob < 0.35:
                risk_level = "Low"
                gauge_color = "#059669" if st.session_state.light_mode else "#2ed573"
            elif prob < 0.70:
                risk_level = "Moderate"
                gauge_color = "#d97706" if st.session_state.light_mode else "#ff9f1a"
            else:
                risk_level = "High"
                gauge_color = "#dc2626" if st.session_state.light_mode else "#ff4d4d"
                
            # Store in predictions
            p_record = {
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "patient_name": patient_name,
                "patient_id": patient_id,
                "disease": name.capitalize(),
                "probability": float(prob),
                "risk_level": risk_level,
                "inputs": mapped_inputs,
                "features": columns
            }
            st.session_state.predictions.append(p_record)
            
            # Render card side-by-side
            with cols_grid[i_col]:
                # Title
                p_titles = {"diabetes": "Diabetes Screen", "heart": "Cardio Health", "liver": "Liver Efficacy", "stroke": "Stroke Risk", "kidney": "Renal Kidney"}
                st.markdown(f"""
                <div class='metric-card' style='border-color: {gauge_color}; border-width: 2px; padding: 15px;'>
                    <div style='display: flex; justify-content: space-between; align-items: center;'>
                        <div class='metric-title' style='font-size: 0.85rem; font-weight: 700; color: {text_color};'>{p_titles[name]}</div>
                        <div style='color: {gauge_color}; background: {gauge_color}11; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;'>{risk_level} Risk</div>
                    </div>
                    <div style='text-align: center; margin: 15px 0px;'>
                        <div style='font-size: 2.3rem; font-weight: 800; color: {gauge_color}; text-shadow: 0 0 10px {gauge_color}25;'>{prob*100:.1f}%</div>
                        <div style='color: {text_muted}; font-size: 0.72rem; font-weight: 500; margin-top: 3px;'>Risk Probability Percentage</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                # Single Plotly risk gauge (compact)
                fig_g = go.Figure(go.Indicator(
                    mode = "gauge",
                    value = prob * 100,
                    domain = {'x': [0, 1], 'y': [0, 1]},
                    gauge = {
                        'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': text_muted, 'tickmode': 'array', 'tickvals': [0, 35, 70, 100]},
                        'bar': {'color': gauge_color},
                        'bgcolor': "rgba(128, 128, 128, 0.08)",
                        'borderwidth': 1,
                        'bordercolor': card_border,
                        'steps': [
                            {'range': [0, 35], 'color': 'rgba(46, 213, 115, 0.08)'},
                            {'range': [35, 70], 'color': 'rgba(255, 159, 26, 0.08)'},
                            {'range': [70, 100], 'color': 'rgba(255, 77, 77, 0.08)'}
                        ]
                    }
                ))
                fig_g.update_layout(
                    template=plot_template,
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font=dict(color=text_color),
                    height=90,
                    margin=dict(l=15, r=15, t=10, b=10)
                )
                st.plotly_chart(fig_g, use_container_width=True)
                
                # Render local SHAP bar chart
                shap_contribs = get_shap_contributions(model, scaler, input_df)
                
                pretty_names = {
                    'Pregnancies': 'Pregnancies', 'Glucose': 'Fasting Glucose', 'BloodPressure': 'Diastolic BP', 
                    'SkinThickness': 'Skin Fat Fold', 'Insulin': 'Insulin', 'BMI': 'BMI Ratio', 
                    'DiabetesPedigreeFunction': 'Family History', 'Age': 'Patient Age', 'age': 'Patient Age', 
                    'sex': 'Biological Sex', 'cp': 'Chest Pain Severity', 'trestbps': 'Systolic BP', 
                    'chol': 'Total Cholesterol', 'fbs': 'Blood Sugar > 120', 'restecg': 'Resting ECG', 
                    'thalach': 'Max Pulse Rate', 'exang': 'Physical Angina', 'oldpeak': 'Heart Strain oldpeak', 
                    'slope': 'ECG wave slope', 'ca': 'Blocked Vessel Count', 'thal': 'Thalassemia scan', 
                    'Total_Bilirubin': 'Total Bilirubin', 'Direct_Bilirubin': 'Direct Bilirubin', 
                    'Alkaline_Phosphotase': 'ALP Liver enzyme', 'Alamine_Aminotransferase': 'ALT Liver enzyme', 
                    'Aspartate_Aminotransferase': 'AST Liver enzyme', 'Total_Protiens': 'Total Proteins', 
                    'Albumin': 'Albumin level', 'Albumin_and_Globulin_Ratio': 'A/G Ratio', 'gender': 'Biological Sex', 
                    'hypertension': 'Hypertension history', 'heart_disease': 'Heart Disease history', 
                    'ever_married': 'Ever Married', 'work_type': 'Work Occupation', 'Residence_type': 'Residence area', 
                    'avg_glucose_level': 'Avg Glucose level', 'smoking_status': 'Smoking History', 'bp': 'Diastolic BP', 
                    'sg': 'Urine specific gravity', 'al': 'Urine Albumin leakage', 'su': 'Urine Sugar leakage', 
                    'rbc': 'Urine Red Cells', 'pc': 'Urine Pus Cells', 'pcc': 'Urine Pus Clumps', 
                    'ba': 'Urine Bacteria', 'bgr': 'Random Glucose', 'bu': 'Blood Urea Nitrogen', 
                    'sc': 'Serum Creatinine', 'sod': 'Sodium level', 'pot': 'Potassium level', 
                    'hemo': 'Hemoglobin level', 'pcv': 'Hematocrit PCV', 'wbcc': 'White Cells count', 
                    'rbcc': 'Red Cells count', 'htn': 'Hypertension history', 'dm': 'Diabetes History', 
                    'cad': 'Coronary Artery history', 'appet': 'Appetite Level', 'pe': 'Pedal Edema fluid', 
                    'ane': 'Anemia history'
                }
                
                shap_df = pd.DataFrame({
                    'Feature': columns,
                    'SHAP Value': shap_contribs,
                    'Value': [mapped_inputs[col] if col in mapped_inputs else input_df[col].iloc[0] for col in columns]
                })
                shap_df['Feature Name'] = shap_df['Feature'].map(pretty_names).fillna(shap_df['Feature']) + " (" + shap_df['Value'].astype(str) + ")"
                shap_df = shap_df.sort_values(by='SHAP Value', key=abs, ascending=True)
                
                # Render top 7 indicators for spatial efficiency
                shap_df = shap_df.tail(7)
                
                colors = ['#ff4d4d' if val >= 0 else '#2ed573' for val in shap_df['SHAP Value']]
                
                fig_shap = go.Figure(go.Bar(
                    y=shap_df['Feature Name'],
                    x=shap_df['SHAP Value'],
                    orientation='h',
                    marker_color=colors
                ))
                fig_shap.update_layout(
                    template=plot_template,
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font=dict(color=text_color, size=8.5),
                    margin=dict(l=5, r=5, t=10, b=10),
                    height=200,
                    xaxis=dict(gridcolor=grid_color),
                    yaxis=dict(gridcolor=grid_color)
                )
                st.plotly_chart(fig_shap, use_container_width=True)
                
        st.success("Diagnostics executed successfully for all toggled active evaluations! Review Care Recommendations or compile EMR Report.")

# PAGE: EXPLAINABLE AI
elif st.session_state.page == "🔍 Explainable AI (SHAP)":
    st.markdown("<div class='section-header'>🔍 Explainable AI (Global Model SHAP attributions)</div>", unsafe_allow_html=True)
    st.markdown("We implement **SHAP (SHapley Additive exPlanations)** to establish total algorithm accountability and validate machine-learning diagnostic classification logic.")
    
    eai_disease = st.selectbox("Select Diagnostics Model for SHAP Attributions", ["diabetes", "heart", "liver", "stroke", "kidney"])
    
    try:
        model, scaler, columns, X_train, explainer = load_model_components(eai_disease)
        shap_values = joblib.load(f'shap_files/{eai_disease}_shap_values.joblib')
        X_test = joblib.load(f'shap_files/{eai_disease}_X_test.joblib')
    except FileNotFoundError:
        st.error(f"Pre-computed SHAP files for **{eai_disease}** not found. Please run the model training pipeline `train_models.py` first.")
        st.stop()
        
    tab1, tab2 = st.tabs(["📊 Global Feature Impact", "🐝 SHAP Beeswarm Summary Plot"])
    
    with tab1:
        st.markdown("### Interactive Global Feature Importance (Plotly)")
        st.markdown("Calculated based on the **mean absolute SHAP value** across the entire validation cohort. Indicates which features have the strongest overall influence on risk calculations.")
        
        # Calculate mean absolute SHAP
        if isinstance(shap_values, list):
            s_vals = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            s_vals = shap_values[:, :, 1]
        else:
            s_vals = shap_values
            
        mean_abs_shap = np.mean(np.abs(s_vals), axis=0)
        
        pretty_names = {
            'Pregnancies': 'Pregnancies Count', 'Glucose': 'Fasting Blood Sugar', 'BloodPressure': 'Diastolic BP', 
            'SkinThickness': 'Skin Fat Fold', 'Insulin': 'Insulin level', 'BMI': 'Body Mass Index', 
            'DiabetesPedigreeFunction': 'Family History score', 'Age': 'Patient Age', 'age': 'Patient Age', 
            'sex': 'Biological Sex', 'cp': 'Chest Pain Type', 'trestbps': 'Resting Systolic BP', 
            'chol': 'Total Cholesterol', 'fbs': 'Blood Sugar > 120', 'restecg': 'Resting ECG', 
            'thalach': 'Max Heart Rate', 'exang': 'Exercise Angina', 'oldpeak': 'Heart Strain (oldpeak)', 
            'slope': 'ECG ST Slope', 'ca': 'Blocked Vessel Count', 'thal': 'Thalassemia Scan', 
            'Total_Bilirubin': 'Total Bilirubin', 'Direct_Bilirubin': 'Direct Bilirubin', 
            'Alkaline_Phosphotase': 'ALP Liver Enzyme', 'Alamine_Aminotransferase': 'ALT Liver Enzyme', 
            'Aspartate_Aminotransferase': 'AST Liver Enzyme', 'Total_Protiens': 'Total Proteins', 
            'Albumin': 'Albumin level', 'Albumin_and_Globulin_Ratio': 'A/G Ratio', 'gender': 'Biological Sex', 
            'hypertension': 'Hypertension History', 'heart_disease': 'Heart Disease History', 
            'ever_married': 'Ever Married', 'work_type': 'Work Occupation', 'Residence_type': 'Residence Area', 
            'avg_glucose_level': 'Avg Glucose level', 'smoking_status': 'Smoking History', 'bp': 'Diastolic BP', 
            'sg': 'Urine Specific Gravity', 'al': 'Urine Albumin Leak', 'su': 'Urine Sugar Leak', 
            'rbc': 'Urine Red Blood Cells', 'pc': 'Urine Pus Cells', 'pcc': 'Urine Pus Clumps', 
            'ba': 'Urine Bacteria', 'bgr': 'Random Glucose', 'bu': 'Blood Urea Nitrogen', 
            'sc': 'Serum Creatinine', 'sod': 'Sodium level', 'pot': 'Potassium level', 
            'hemo': 'Hemoglobin Level', 'pcv': 'Hematocrit PCV', 'wbcc': 'White Blood Cells', 
            'rbcc': 'Red Blood Cells', 'htn': 'Hypertension history', 'dm': 'Diabetes History', 
            'cad': 'Coronary Artery history', 'appet': 'Appetite Level', 'pe': 'Pedal Edema Fluid', 
            'ane': 'Anemia History'
        }
        
        imp_df = pd.DataFrame({
            'Feature': columns,
            'Mean Absolute SHAP (Impact)': mean_abs_shap
        })
        imp_df['Feature Name'] = imp_df['Feature'].map(pretty_names).fillna(imp_df['Feature'])
        imp_df = imp_df.sort_values(by='Mean Absolute SHAP (Impact)', ascending=True)
        
        fig_global = go.Figure(go.Bar(
            y=imp_df['Feature Name'],
            x=imp_df['Mean Absolute SHAP (Impact)'],
            orientation='h',
            marker_color=primary_color
        ))
        fig_global.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=text_color),
            xaxis=dict(title="Mean Absolute SHAP Value (Overall Influence)", gridcolor=grid_color),
            yaxis=dict(gridcolor=grid_color),
            height=460,
            margin=dict(l=10, r=10, t=10, b=10)
        )
        st.plotly_chart(fig_global, use_container_width=True)
        
    with tab2:
        st.markdown("### Standard SHAP Beeswarm Summary Plot (Theme Synchronized)")
        st.markdown("The summary beeswarm plot shows the **directionality** of risk factors. Each dot represents a patient. High feature values are colored red; low values are colored blue. A positive SHAP value indicates that elevated levels of that clinical variable increase disease risk classification.")
        
        fig, ax = plt.subplots(figsize=(10, 6))
        fig.patch.set_facecolor(bg_color)
        ax.set_facecolor(bg_color)
        ax.spines['bottom'].set_color(plt_theme_color)
        ax.spines['left'].set_color(plt_theme_color)
        ax.spines['top'].set_color('none')
        ax.spines['right'].set_color('none')
        ax.tick_params(axis='x', colors=plt_theme_color, labelsize=9)
        ax.tick_params(axis='y', colors=plt_theme_color, labelsize=9)
        ax.xaxis.label.set_color(plt_theme_color)
        ax.yaxis.label.set_color(plt_theme_color)
        
        X_test_plot = X_test.rename(columns=pretty_names)
        
        if isinstance(shap_values, list):
            shap.summary_plot(shap_values[1], X_test_plot, show=False, plot_size=None)
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            shap.summary_plot(shap_values[:, :, 1], X_test_plot, show=False, plot_size=None)
        else:
            shap.summary_plot(shap_values, X_test_plot, show=False, plot_size=None)
            
        plt.tight_layout()
        st.pyplot(fig)

# PAGE: ANALYTICS & INSIGHTS
elif st.session_state.page == "📊 Cohort Insights & Trends":
    st.markdown("<div class='section-header'>📊 Clinical Cohort Insights & Analytics</div>", unsafe_allow_html=True)
    st.markdown("Comprehensive clinical data distributions, cross-disease correlation maps, and simulated caseload trends.")
    
    tab_insights, tab_factors, tab_trends = st.tabs(["🔬 Cohort Insights", "⚡ Key Risk Factor Matrices", "📈 Case Screening Trends"])
    
    with tab_insights:
        st.markdown("### Clinical Feature Distributions")
        ana_disease = st.selectbox("Select Screening Dataset to Analyze", ["diabetes", "heart", "liver", "stroke", "kidney"])
        
        try:
            df_ana = pd.read_csv(f'data/{ana_disease}.csv', encoding='utf-8-sig')
        except FileNotFoundError:
            st.error(f"Dataset for {ana_disease} not found in `data/` directory.")
            st.stop()
            
        col_dist1, col_dist2 = st.columns(2)
        
        with col_dist1:
            st.markdown("#### Patient Cohort Age Distribution")
            t_col = 'Outcome' if 'Outcome' in df_ana.columns else ('target' if 'target' in df_ana.columns else ('Dataset' if 'Dataset' in df_ana.columns else ('classification' if 'classification' in df_ana.columns else 'stroke')))
            
            age_col = 'Age' if 'Age' in df_ana.columns else ('age' if 'age' in df_ana.columns else None)
            if age_col in df_ana.columns:
                df_ana_plot = df_ana.copy()
                if t_col == 'Dataset':
                    df_ana_plot['Diagnosis'] = df_ana_plot[t_col].map({1: "Positive", 2: "Negative"})
                elif t_col == 'classification':
                    df_ana_plot['classification'] = df_ana_plot['classification'].str.strip()
                    df_ana_plot['Diagnosis'] = df_ana_plot[t_col].map({"ckd": "Positive", "notckd": "Negative"})
                else:
                    df_ana_plot['Diagnosis'] = df_ana_plot[t_col].map({1: "Positive", 0: "Negative"})
                    
                fig_hist = px.histogram(
                    df_ana_plot,
                    x=age_col,
                    color="Diagnosis",
                    barmode="overlay",
                    color_discrete_map={"Positive": "#ff4d4d", "Negative": "#2ed573"},
                    opacity=0.65
                )
                fig_hist.update_layout(
                    template=plot_template,
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font=dict(color=text_color),
                    xaxis=dict(title="Age (Years)", gridcolor=grid_color),
                    yaxis=dict(title="Count", gridcolor=grid_color)
                )
                st.plotly_chart(fig_hist, use_container_width=True)
            else:
                st.info("Age column not found in this dataset.")
                
        with col_dist2:
            st.markdown("#### Clinical Feature Correlation Map")
            numeric_df = df_ana.copy()
            if 'classification' in numeric_df.columns:
                numeric_df = numeric_df.drop(columns=['classification'])
            if 'Dataset' in numeric_df.columns:
                numeric_df = numeric_df.drop(columns=['Dataset'])
                
            numeric_df = numeric_df.replace('?', np.nan)
            for col in numeric_df.columns:
                numeric_df[col] = pd.to_numeric(numeric_df[col], errors='coerce')
                
            numeric_cols = numeric_df.select_dtypes(include=[np.number]).columns.tolist()
            corr = numeric_df[numeric_cols].corr()
            
            fig_corr, ax_corr = plt.subplots(figsize=(6, 4))
            fig_corr.patch.set_facecolor(bg_color)
            ax_corr.set_facecolor(bg_color)
            
            sns.heatmap(
                corr,
                annot=False,
                cmap="coolwarm",
                ax=ax_corr,
                cbar=True
            )
            ax_corr.tick_params(colors=plt_theme_color, labelsize=7)
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            st.pyplot(fig_corr)
            
    with tab_factors:
        st.markdown("### Cross-Disease Critical Risk Indicators Matrix")
        st.markdown("A matrix showing which clinical indicators are active high-ranking predictors across multiple disease diagnostic categories.")
        
        cross_df = pd.DataFrame({
            "Clinical Indicator": ["Age (Seniority)", "Systolic/Diastolic BP", "BMI (Obesity Ratio)", "Blood Glucose level", "Hemoglobin (Anemia)", "Smoking Status"],
            "Diabetes Diagnostic": ["Moderate (SHAP Rank 3)", "Moderate (SHAP Rank 5)", "High (SHAP Rank 2)", "Critical (SHAP Rank 1)", "N/A", "N/A"],
            "Heart Diagnostics": ["High (SHAP Rank 2)", "Moderate (SHAP Rank 4)", "N/A", "N/A", "N/A", "N/A"],
            "Liver Function": ["Moderate (SHAP Rank 4)", "N/A", "N/A", "N/A", "N/A", "N/A"],
            "Stroke Predictor": ["Critical (SHAP Rank 1)", "Moderate (SHAP Rank 4)", "Low (SHAP Rank 6)", "High (SHAP Rank 2)", "N/A", "Moderate (SHAP Rank 5)"],
            "Kidney Diagnostics": ["Low (SHAP Rank 12)", "Moderate (SHAP Rank 5)", "N/A", "Moderate (SHAP Rank 6)", "Critical (SHAP Rank 1)", "N/A"]
        })
        st.table(cross_df)
        
    with tab_trends:
        st.markdown("### Simulated Monthly Caseload & Detection Volume")
        st.markdown(" Caseload tracking of patients screened vs high-risk positive detections in the clinical workflow.")
        
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        screenings = [280, 310, 350, 420, 390, 410, 450, 480, 520, 500, 580, 640]
        detected_cases = [45, 48, 54, 72, 63, 68, 75, 88, 102, 95, 115, 134]
        
        fig_trend = go.Figure()
        fig_trend.add_trace(go.Scatter(
            x=months,
            y=screenings,
            mode='lines+markers',
            name='Total Screened Patients',
            line=dict(color='#0284c7' if st.session_state.light_mode else '#00f0ff', width=3),
            marker=dict(size=6)
        ))
        fig_trend.add_trace(go.Scatter(
            x=months,
            y=detected_cases,
            mode='lines+markers',
            name='High Risk Detections',
            line=dict(color='#ff4d4d', width=3),
            marker=dict(size=6)
        ))
        fig_trend.update_layout(
            template=plot_template,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color=text_color),
            xaxis=dict(title="Month", gridcolor=grid_color),
            yaxis=dict(title="Cases", gridcolor=grid_color),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_trend, use_container_width=True)

# PAGE: CARE RECOMMENDATIONS (DYNAMIC MULTI-DISEASE TABS)
elif st.session_state.page == "💡 Personalized Care Advisor":
    st.markdown("<div class='section-header'>💡 Dynamic Care Advisor Recommendations</div>", unsafe_allow_html=True)
    st.markdown("Actionable diagnostic advice dynamically generated based on all high-risk clinical findings identified during active screenings.")
    
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
        },
        "Kidney": {
            "High": {
                "medical": ["Urgent nephrology assessment required.", "Strict blood pressure target control (<130/80 mm/Hg).", "Monitor glomerular filtration rate (eGFR) and serum creatinine panels bi-weekly."],
                "diet": ["Strict low-sodium DASH diet (limit sodium to <1500mg/day).", "Restrict protein load dynamically to protect kidney filtration.", "Limit high-potassium and high-phosphorus foods (bananas, tomatoes, dairy) as clinically indicated."],
                "exercise": ["Engage in moderate-to-light low-impact cardiovascular routines.", "Absolutely avoid heavy physical strain or workouts that increase blood pressure sharply."],
                "lifestyle": ["Absolute strict avoidance of nephrotoxic drugs (especially NSAIDs like Ibuprofen, Naproxen).", "Complete immediate smoking cessation to maximize renal perfusion."]
            },
            "Moderate": {
                "medical": ["Review kidney function biomarkers with a primary physician.", "Track urine albumin and serum creatinine in 3 months."],
                "diet": ["Limit high-sodium processed foods, maintain balanced protein targets."],
                "exercise": ["Incorporate 150 minutes of weekly moderate aerobic activity."],
                "lifestyle": ["Avoid toxic occupational chemicals, stay properly hydrated, and stop NSAID self-medication."]
            },
            "Low": {
                "medical": ["Annual wellness screening including urinalysis and renal panel markers."],
                "diet": ["Adopt a balanced, whole food, plant-rich Mediterranean-style diet."],
                "exercise": ["Maintain an active physical conditioning schedule."],
                "lifestyle": ["Prioritize quality sleep, maintain stable systemic blood pressure."]
            }
        }
    }
    
    # Filter predictions strictly from active session
    if st.session_state.predictions:
        # Group by disease to get latest prediction of each
        latest_preds = {}
        for p in st.session_state.predictions:
            latest_preds[p['disease']] = p
            
        st.success(f"Diagnostics history active: Found {len(latest_preds)} evaluated EMR profiles for patient **{list(latest_preds.values())[0]['patient_name']}**.")
        
        # Render a beautiful Tab selector for each active disease advisor
        disease_tabs = st.tabs([f"🏥 {d_key} Advisor" for d_key in latest_preds.keys()])
        
        for idx, (d_key, p_rec) in enumerate(latest_preds.items()):
            with disease_tabs[idx]:
                active_risk = p_rec['risk_level']
                recs = rec_database[d_key][active_risk]
                
                priority_badges = {
                    "High": ("🚨 CRITICAL PRIORITY CLINICAL ACTIONS", "#ff4d4d"),
                    "Moderate": ("⚠️ HIGH PRIORITY MONITORING ACTIONS", "#ff9f1a"),
                    "Low": ("✅ GENERAL LIFESTYLE MAINTENANCE", "#2ed573")
                }
                badge_text, badge_color = priority_badges[active_risk]
                
                st.markdown(f"""
                <div style='background: {card_bg}; border-left: 5px solid {badge_color}; padding: 15px; border-radius: 8px; margin-bottom: 20px; {shadow_css}'>
                    <h4 style='color: {badge_color}; margin: 0; font-size: 0.95rem; font-weight: 800;'>{badge_text}</h4>
                    <p style='color: {text_muted}; font-size: 0.8rem; margin-top: 5px; margin-bottom: 0; font-weight: 500;'>Personalized advice synthesized for a <b>{active_risk} Risk</b> prediction model classification for <b>{d_key}</b>.</p>
                </div>
                """, unsafe_allow_html=True)
                
                col_rec1, col_rec2 = st.columns(2)
                
                with col_rec1:
                    st.markdown(f"""
                    <div class='clinical-panel-card'>
                        <div class='panel-card-title'>🩺 Clinical & Medical Management</div>
                    """, unsafe_allow_html=True)
                    for item in recs['medical']:
                        st.markdown(f"- {item}")
                    st.markdown("</div>", unsafe_allow_html=True)
                    
                    st.markdown(f"""
                    <div class='clinical-panel-card'>
                        <div class='panel-card-title'>🍏 Dietary Guidelines</div>
                    """, unsafe_allow_html=True)
                    for item in recs['diet']:
                        st.markdown(f"- {item}")
                    st.markdown("</div>", unsafe_allow_html=True)
                    
                with col_rec2:
                    st.markdown(f"""
                    <div class='clinical-panel-card'>
                        <div class='panel-card-title'>🏃‍♂️ Physical Conditioning & Cardiorespiratory</div>
                    """, unsafe_allow_html=True)
                    for item in recs['exercise']:
                        st.markdown(f"- {item}")
                    st.markdown("</div>", unsafe_allow_html=True)
                    
                    st.markdown(f"""
                    <div class='clinical-panel-card'>
                        <div class='panel-card-title'>💤 Lifestyle & Daily Health Logs</div>
                    """, unsafe_allow_html=True)
                    for item in recs['lifestyle']:
                        st.markdown(f"- {item}")
                    st.markdown("</div>", unsafe_allow_html=True)
    else:
        st.info("No active diagnostic screenings executed in this session. Defaulting to general cardiovascular references:")
        recs = rec_database["Heart"]["Low"]
        
        col_rec1, col_rec2 = st.columns(2)
        with col_rec1:
            st.markdown("#### 🩺 Clinical & Medical Management")
            for item in recs['medical']: st.markdown(f"- {item}")
        with col_rec2:
            st.markdown("#### 🍏 Dietary Guidelines")
            for item in recs['diet']: st.markdown(f"- {item}")

# PAGE: CLINICAL EMR PDF REPORT GENERATOR
elif st.session_state.page == "📋 Clinical EMR Report":
    st.markdown("<div class='section-header'>📋 Export Diagnostic Clinical EMR Report</div>", unsafe_allow_html=True)
    st.markdown("Compile printable diagnostic medical reports summarizing patient history, risk diagnostics, and care advisor records.")
    
    if not st.session_state.predictions:
        st.warning("No screenings performed yet in this session. Complete a diagnostic profile screen first to generate a report.")
        st.stop()
        
    st.markdown("### 1. Patient EMR & Clinician Demographics")
    col_rep1, col_rep2 = st.columns(2)
    with col_rep1:
        rep_patient_name = st.text_input("Patient Full Name", value=st.session_state.predictions[-1]['patient_name'])
        rep_patient_id = st.text_input("Patient ID Number", value=st.session_state.predictions[-1]['patient_id'])
        # Read baseline age safely
        latest_age = st.session_state.predictions[-1]['inputs'].get('age', st.session_state.predictions[-1]['inputs'].get('Age', 45))
        rep_patient_age = st.number_input("Patient Age in Years", min_value=1, max_value=120, value=int(latest_age))
    with col_rep2:
        rep_clinician = st.text_input("Diagnosing Clinician Name", value=st.session_state.clinician_name)
        rep_date = st.date_input("Evaluation Report Date", value=datetime.date.today())
        rep_notes = st.text_area("Clinical Summary Diagnoses", value="Patient screened using ML diagnostic profiling for chronic diseases risk validation.")
        
    st.markdown("### 2. Diagnostics Elements Selection")
    
    # Filter unique latest screenings of this session
    unique_preds = {}
    for p in st.session_state.predictions:
        unique_preds[p['disease']] = p
        
    selected_preds = []
    for idx, (d_name_key, p) in enumerate(unique_preds.items()):
        inc = st.checkbox(
            f"Include Screen: {p['disease']} Evaluation ({p['timestamp']}) — Risk Score: {p['risk_level']} ({p['probability']*100:.1f}%)",
            value=True,
            key=f"rep_check_{idx}"
        )
        if inc:
            selected_preds.append(p)
            
    if not selected_preds:
        st.error("Please include at least one diagnostic evaluation to compile the clinical PDF report.")
        st.stop()
        
    if st.button("Generate & Compile Clinical EMR Report"):
        class ClinicalPDF(FPDF):
            def header(self):
                self.set_font("Helvetica", "B", 14)
                self.set_text_color(0, 102, 204) 
                self.cell(0, 10, "AI HEALTHCARE CLINICAL ANALYTICS PLATFORM", border=False, ln=True, align="L")
                
                self.set_font("Helvetica", "", 9)
                self.set_text_color(100, 100, 100)
                self.cell(0, 5, "EXPLAINABLE CLINICAL DECISION SUPPORT REPORT", border=False, ln=True, align="L")
                
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
        
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(51, 51, 51)
        pdf.cell(0, 8, "I. PATIENT & CLINICAL EVALUATION DETAILS", ln=True)
        pdf.ln(2)
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(240, 245, 250)
        
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
        
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(45, 6, "Clinical Case Notes:", ln=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.multi_cell(0, 5, rep_notes, border=1)
        
        pdf.ln(8)
        
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(51, 51, 51)
        pdf.cell(0, 8, "II. PREDICTIVE DIAGNOSTICS & SHAP RISK EVALUATIONS", ln=True)
        pdf.ln(2)
        
        for idx, p in enumerate(selected_preds):
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(0, 102, 204)
            pdf.cell(0, 6, f"Diagnostic Test {idx+1}: {p['disease']} Risk Profile", ln=True)
            
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(51, 51, 51)
            pdf.cell(40, 6, "Calculated Risk Score:", border=0)
            pdf.set_font("Helvetica", "", 9)
            pdf.cell(50, 6, f" {p['probability']*100:.1f}% Risk Probability", border=0)
            
            pdf.set_font("Helvetica", "B", 9)
            pdf.cell(40, 6, "Assigned Severity:", border=0)
            pdf.set_font("Helvetica", "B", 9)
            if p['risk_level'] == "High":
                pdf.set_text_color(204, 0, 0) 
            elif p['risk_level'] == "Moderate":
                pdf.set_text_color(204, 102, 0) 
            else:
                pdf.set_text_color(0, 153, 76) 
            pdf.cell(50, 6, f" {p['risk_level']} Classification", border=0, ln=True)
            
            pdf.set_text_color(51, 51, 51)
            pdf.ln(2)
            
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_fill_color(245, 245, 245)
            pdf.cell(70, 5, "Clinical Indicator Variable", border=1, fill=True)
            pdf.cell(50, 5, "Observed Patient Value", border=1, fill=True, ln=True)
            
            pdf.set_font("Helvetica", "", 8)
            for k, val in p['inputs'].items():
                disp_k = k.replace("_", " ").title()
                pdf.cell(70, 5, f" {disp_k}", border=1)
                pdf.cell(50, 5, f" {val}", border=1, ln=True)
                
            pdf.ln(5)
            
        pdf.ln(5)
        
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(204, 0, 0)
        pdf.cell(0, 6, "III. RIGOROUS MEDICAL CLINICAL DISCLAIMER", ln=True)
        pdf.ln(1)
        pdf.set_font("Helvetica", "I", 8.5)
        pdf.set_text_color(100, 100, 100)
        disclaimer_text = (
            "This diagnostic evaluation report is compiled utilizing machine learning algorithms trained on historic reference "
            "datasets. All evaluations and mathematical assessments generated by this system are designed to serve "
            "strictly as analytical decision support tools for licensed physicians and practitioners. They DO NOT serve "
            "as absolute diagnostics or replacements for professional clinical judgment, bedside physical evaluation, or direct "
            "laboratory verification. The final assessment remains the complete, legal responsibility of the supervising "
            "medical professional."
        )
        pdf.multi_cell(0, 5, disclaimer_text, border=1)
        
        pdf_bytes = pdf.output()
        
        st.markdown("### Report Compiled Successfully!")
        st.success("Your printable clinical report has been compiled and is ready for local storage or print routing.")
        st.download_button(
            label="💾 Download EMR Diagnostics PDF Report",
            data=bytes(pdf_bytes),
            file_name=f"clinical_analytics_report_{rep_patient_id}_{datetime.date.today()}.pdf",
            mime="application/pdf"
        )

# BESPOKE EMR FOOTER RENDER
st.markdown(f"""
<div class='clinical-footer'>
    © 2026 Clini-SHAP Healthcare Platform | Metro Health System Diagnostics Dept | Licensed Clinical CDSS Access Only
</div>
""", unsafe_allow_html=True)
