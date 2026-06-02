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
    st.session_state.page = "🏥 Clinic Dashboard"

if 'light_mode' not in st.session_state:
    st.session_state.light_mode = False

# ------------------------------------------------------------
# DYNAMIC THEME SYSTEM SELECTOR
# ------------------------------------------------------------
# We place the toggle cleanly in the sidebar navigation
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
    
    /* Hide Default Streamlit Menu Header and Footer */
    header, footer, #MainMenu, [data-testid="stHeader"] {{
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
# BESPOKE EMR HEADER NAVBAR RENDER
# ------------------------------------------------------------
st.markdown(f"""
<div class='emr-header-navbar'>
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
            <div style='color: {text_color}; font-size: 0.82rem; font-weight: 700;'>Dr. Sarah Carter, MD</div>
        </div>
        <div style='display: flex; align-items: center; gap: 8px;'>
            <span class='pulse-dot'></span>
            <span style='color: {text_color}; font-size: 0.8rem; font-weight: 600;'>System Active</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------------------------------------------------
# SIDEBAR DRAWER NAVIGATION LOGIC
# ------------------------------------------------------------
with st.sidebar:
    # Hospital Profile Branding Card
    st.markdown(f"""
    <div style='background: {card_bg}; padding: 14px; border-radius: 10px; border: 1px solid {card_border}; margin-bottom: 18px; {shadow_css}'>
        <div style='display: flex; align-items: center; gap: 10px;'>
            <div style='font-size: 1.6rem;'>🏬</div>
            <div>
                <div style='color: {text_color}; font-weight: 800; font-size: 0.88rem; letter-spacing: 0.3px;'>METRO HEALTH SYSTEM</div>
                <div style='color: {text_muted}; font-size: 0.72rem; font-weight: 600;'>Diagnostics Center</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown(f"<p style='color: {text_muted}; font-size: 0.72rem; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 5px;'>🧭 Main Navigation</p>", unsafe_allow_html=True)
    
    # Custom Drawer styled items
    nav_options = [
        ("🏥 Clinic Dashboard", "Dashboard Overview"),
        ("🍬 Diabetes Risk Profile", "Diabetes Predictor"),
        ("❤️ Heart Health Profile", "Heart Disease Predictor"),
        ("🧪 Liver Efficacy Profile", "Liver Disease Predictor"),
        ("🧠 Stroke Risk Profile", "Stroke Predictor"),
        ("🩸 Kidney Function Profile", "Kidney Disease Predictor"),
        ("🔍 Explainable AI (SHAP)", "Explainable AI (SHAP)"),
        ("📊 Cohort Insights & Trends", "Analytics & Insights"),
        ("💡 Personalized Care Advisor", "Recommendations System"),
        ("📋 Clinical EMR Report", "Clinical Report Generator")
    ]
    
    for display_name, internal_page in nav_options:
        is_active = st.session_state.page == display_name
        
        # We style active item dynamically using Custom Inject Style tags before button render
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
            
    st.markdown("<hr style='margin: 15px 0; opacity: 0.15;'>", unsafe_allow_html=True)
    
    # Structured disclaimer in sidebar
    st.markdown(f"""
    <div style='background: {card_bg}; padding: 12px; border-radius: 10px; border: 1px solid rgba(239, 68, 68, 0.15); {shadow_css}'>
        <p style='color: #ef4444; font-size: 0.72rem; font-weight: bold; margin: 0; margin-bottom: 4px; text-transform: uppercase; display: flex; align-items: center; gap: 5px;'>⚠️ Disclaimer</p>
        <p style='color: {text_muted}; font-size: 0.68rem; margin: 0; line-height: 1.3;'>This CDSS is intended for educational research and diagnostics baseline testing only. Licensed validation required.</p>
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
        # XGBoost models: use KernelExplainer on the fly
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

# PAGE 1: CLINICAL DASHBOARD OVERVIEW
if st.session_state.page == "🏥 Clinic Dashboard":
    st.markdown("<div class='section-header'>🔬 Diagnostics Cohort Dashboard</div>", unsafe_allow_html=True)
    st.markdown("Real-time clinical screening analytics powered by pre-trained **XGBoost & RandomForest EMR Classifiers**.")
    
    # Active Models Performance Cards
    st.markdown("#### Active Diagnostics Models")
    cols = st.columns(5)
    disease_titles = {
        "diabetes": "Diabetes Screen",
        "heart": "Cardio Health",
        "liver": "Liver Function",
        "stroke": "Stroke Predictor",
        "kidney": "Kidney Diagnostics"
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
                    <div class='metric-sub'>EMR Size: <span>{samples} Cases</span></div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class='metric-card'>
                    <div class='metric-title'>{title}</div>
                    <div class='metric-value'>N/A</div>
                    <div class='metric-sub'>Model not loaded</div>
                </div>
                """, unsafe_allow_html=True)
                
    st.markdown("---")
    
    # Dual-Theme customized visual charts
    chart_col1, chart_col2 = st.columns([3, 2])
    
    with chart_col1:
        st.markdown("#### 📊 Comparative Model Evaluation (Validation Cohort)")
        if metrics:
            m_df = pd.DataFrame(metrics).T.reset_index()
            m_df['index'] = m_df['index'].str.upper()
            fig = go.Figure()
            fig.add_trace(go.Bar(
                x=m_df['index'],
                y=m_df['accuracy'],
                name='Model Accuracy',
                marker_color='#0284c7' if st.session_state.light_mode else '#00f0ff'
            ))
            fig.add_trace(go.Bar(
                x=m_df['index'],
                y=m_df['roc_auc'],
                name='AUC-ROC Score',
                marker_color='#10b981' if st.session_state.light_mode else '#2ed573'
            ))
            fig.add_trace(go.Bar(
                x=m_df['index'],
                y=m_df['f1'],
                name='F1-Score',
                marker_color='#7c3aed' if st.session_state.light_mode else '#c084fc'
            ))
            fig.update_layout(
                template=plot_template,
                barmode='group',
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color=text_color),
                xaxis=dict(gridcolor=grid_color),
                yaxis=dict(gridcolor=grid_color, tickformat=".0%"),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            st.plotly_chart(fig, use_container_width=True)
            
    with chart_col2:
        st.markdown("#### 🧪 Screening Cohort Diagnostics Prevalence")
        if metrics:
            p_df = pd.DataFrame([
                {"Disease": "Diabetes", "Prevalence": metrics['diabetes']['positive_prevalence']},
                {"Disease": "Heart", "Prevalence": metrics['heart']['positive_prevalence']},
                {"Disease": "Liver", "Prevalence": metrics['liver']['positive_prevalence']},
                {"Disease": "Stroke", "Prevalence": metrics['stroke']['positive_prevalence']},
                {"Disease": "Kidney", "Prevalence": metrics['kidney']['positive_prevalence']}
            ])
            fig_pie = px.pie(
                p_df,
                values='Prevalence',
                names='Disease',
                hole=0.45,
                color_discrete_sequence=['#0284c7', '#10b981', '#7c3aed', '#f59e0b', '#ec4899']
            )
            fig_pie.update_layout(
                template=plot_template,
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color=text_color),
                legend=dict(orientation="h", yanchor="bottom", y=-0.1, xanchor="center", x=0.5)
            )
            st.plotly_chart(fig_pie, use_container_width=True)
            
    st.markdown("---")
    
    # Active Session Predictions history
    st.markdown("#### 📋 Recent EMR Screening Assessments (Active Session)")
    if st.session_state.predictions:
        p_history = []
        for p in st.session_state.predictions:
            p_history.append({
                "Timestamp": p['timestamp'],
                "Patient EMR Identity": f"{p['patient_name']} ({p['patient_id']})",
                "Diagnostic Category": p['disease'],
                "Risk Percentage": f"{p['probability']*100:.1f}%",
                "Assigned Risk Severity": p['risk_level']
            })
        st.table(pd.DataFrame(p_history))
    else:
        st.info("No screenings performed yet in this session. Head to a disease predictor in the navigation drawer to execute a profile.")

# DIAGNOSTICS PREDICTORS
elif "Profile" in st.session_state.page:
    disease_map = {
        "🍬 Diabetes Risk Profile": "diabetes",
        "❤️ Heart Health Profile": "heart",
        "🧪 Liver Efficacy Profile": "liver",
        "🧠 Stroke Risk Profile": "stroke",
        "🩸 Kidney Function Profile": "kidney"
    }
    d_name = disease_map[st.session_state.page]
    d_title = st.session_state.page
    
    st.markdown(f"<div class='section-header'>{d_title}</div>", unsafe_allow_html=True)
    
    try:
        model, scaler, columns, X_train, explainer = load_model_components(d_name)
    except FileNotFoundError:
        st.error(f"Saved pre-trained model elements for **{d_name}** not found. Verify files in `models/` directory.")
        st.stop()
        
    st.markdown("Complete the patients clinical panel below to execute machine-learning diagnostic risk scoring and generate local feature attributions.")
    
    col_f, col_r = st.columns([3, 2])
    
    with col_f:
        st.markdown("### Clinical Inputs Form")
        with st.form("clinical_form"):
            # Section 1: Demographics
            st.markdown("""
            <div class='panel-card-title'>👤 Patient Identification</div>
            """, unsafe_allow_html=True)
            col_id1, col_id2 = st.columns(2)
            with col_id1:
                patient_name = st.text_input("Patient Name", value="Jane Doe")
            with col_id2:
                patient_id = st.text_input("EMR Registry Number", value="EMR-98231")
                
            inputs = {}
            
            # Category panels for forms
            if d_name == "diabetes":
                st.markdown("<div class='panel-card-title'>🩺 Demographic & Vital Signs</div>", unsafe_allow_html=True)
                col_dia1, col_dia2 = st.columns(2)
                with col_dia1:
                    inputs['Pregnancies'] = st.slider("Past Pregnancies Count", 0, 20, 3, help="Total number of times pregnant.")
                    st.markdown("<span class='ref-badge'>Clinical: Pregnancies</span>", unsafe_allow_html=True)
                    
                    inputs['BloodPressure'] = st.slider("Resting Lower Blood Pressure (Diastolic) in mm Hg", 0, 150, 72, help="Arterial pressure when heart rests between beats.")
                    st.markdown("<span class='ref-badge'>Clinical: BloodPressure | Healthy: 60 - 80 mm Hg</span>", unsafe_allow_html=True)
                with col_dia2:
                    inputs['Age'] = st.slider("Patient Age in Years", 21, 120, 29)
                    st.markdown("<span class='ref-badge'>Clinical: Age</span>", unsafe_allow_html=True)
                    
                    inputs['BMI'] = st.slider("Body Mass Index / Obesity Ratio (BMI)", 0.0, 70.0, 32.0, 0.1, help="Obesity index based on height/weight.")
                    st.markdown("<span class='ref-badge'>Clinical: BMI | Healthy: 18.5 - 24.9</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🧪 Endocrine Laboratory Panel</div>", unsafe_allow_html=True)
                col_dia3, col_dia4 = st.columns(2)
                with col_dia3:
                    inputs['Glucose'] = st.slider("Fasting Blood Sugar level (Glucose) in mg/dl", 0, 200, 117, help="Plasma glucose concentration in standard tolerance test.")
                    st.markdown("<span class='ref-badge'>Clinical: Glucose | Healthy: Under 100 mg/dl</span>", unsafe_allow_html=True)
                    
                    inputs['SkinThickness'] = st.slider("Triceps Skin Fold Thickness in mm", 0, 100, 23, help="Thickness of back-arm skin folds to estimate body fat.")
                    st.markdown("<span class='ref-badge'>Clinical: SkinThickness | Typical: 10 - 50 mm</span>", unsafe_allow_html=True)
                with col_dia4:
                    inputs['Insulin'] = st.slider("2-Hour Blood Insulin level in mu U/ml", 0, 900, 30, help="2-hour serum insulin indicator.")
                    st.markdown("<span class='ref-badge'>Clinical: Insulin | Typical: 15 - 276 mu U/ml</span>", unsafe_allow_html=True)
                    
                    inputs['DiabetesPedigreeFunction'] = st.slider("Family History Diabetes Risk Score", 0.0, 3.0, 0.37, 0.01, help="Genetic database mapping diabetes in relatives.")
                    st.markdown("<span class='ref-badge'>Clinical: DiabetesPedigreeFunction | Range: 0.08 - 2.4</span>", unsafe_allow_html=True)
                
            elif d_name == "heart":
                st.markdown("<div class='panel-card-title'>🩺 Demographics & Baseline Vitals</div>", unsafe_allow_html=True)
                col_h1, col_h2 = st.columns(2)
                with col_h1:
                    inputs['age'] = st.slider("Patient Age in Years", 1, 120, 55)
                    st.markdown("<span class='ref-badge'>Clinical: age</span>", unsafe_allow_html=True)
                    
                    sex_lbl = st.selectbox("Biological Sex", ["Female", "Male"], index=1)
                    inputs['sex'] = 1 if sex_lbl == "Male" else 0
                    st.markdown("<span class='ref-badge'>Clinical: sex</span>", unsafe_allow_html=True)
                    
                    inputs['trestbps'] = st.slider("Resting Upper Blood Pressure (Systolic) in mm Hg", 80, 220, 130, help="Blood pressure in mm Hg measured upon hospital admission.")
                    st.markdown("<span class='ref-badge'>Clinical: trestbps | Healthy: Under 120 mm Hg</span>", unsafe_allow_html=True)
                with col_h2:
                    cp_lbl = st.selectbox("Chest Pain Severity Type", ["Typical Heart Angina", "Atypical Non-Classic Pain", "Non-Anginal Muscle Pain", "No Chest Pain (Asymptomatic)"], index=2)
                    cp_map = {"Typical Heart Angina": 0, "Atypical Non-Classic Pain": 1, "Non-Anginal Muscle Pain": 2, "No Chest Pain (Asymptomatic)": 3}
                    inputs['cp'] = cp_map[cp_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: cp</span>", unsafe_allow_html=True)
                    
                    inputs['chol'] = st.slider("Blood Cholesterol level in mg/dl", 100, 600, 240, help="Total blood cholesterol.")
                    st.markdown("<span class='ref-badge'>Clinical: chol | Healthy: Under 200 mg/dl</span>", unsafe_allow_html=True)
                    
                    fbs_lbl = st.selectbox("Fasting Blood Sugar > 120 mg/dl?", ["No", "Yes"], index=0)
                    inputs['fbs'] = 1 if fbs_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: fbs</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🎛️ Electrocardiogram (ECG) Analysis</div>", unsafe_allow_html=True)
                col_h3, col_h4 = st.columns(2)
                with col_h3:
                    restecg_lbl = st.selectbox("Resting Electrocardiogram (ECG) Result", ["Normal ECG", "ST-T Wave Abnormality (Heart strain indicator)", "Left Ventricular Hypertrophy (Enlarged heart walls)"], index=0)
                    restecg_map = {"Normal ECG": 0, "ST-T Wave Abnormality (Heart strain indicator)": 1, "Left Ventricular Hypertrophy (Enlarged heart walls)": 2}
                    inputs['restecg'] = restecg_map[restecg_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: restecg</span>", unsafe_allow_html=True)
                    
                    inputs['thalach'] = st.slider("Maximum Heart Rate Achieved (Pulse)", 50, 250, 153, help="Maximum pulse recorded during cardiorespiratory stress tests.")
                    st.markdown("<span class='ref-badge'>Clinical: thalach</span>", unsafe_allow_html=True)
                with col_h4:
                    inputs['oldpeak'] = st.slider("ECG ST Depression (Heart Stress Marker)", 0.0, 10.0, 0.8, 0.1, help="Electrocardiogram heart strain marker. Higher suggests lack of oxygen.")
                    st.markdown("<span class='ref-badge'>Clinical: oldpeak | Normal: Under 1.0</span>", unsafe_allow_html=True)
                    
                    slope_lbl = st.selectbox("Exercise Wave ST Segment Slope", ["Upsloping (Healthy response)", "Flat Slope (Mild strain)", "Downsloping (Severe risk)"], index=1)
                    slope_map = {"Upsloping (Healthy response)": 0, "Flat Slope (Mild strain)": 1, "Downsloping (Severe risk)": 2}
                    inputs['slope'] = slope_map[slope_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: slope</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>❤️ Cardiovascular History & Bloodflow</div>", unsafe_allow_html=True)
                col_h5, col_h6 = st.columns(2)
                with col_h5:
                    exang_lbl = st.selectbox("Angina Pain triggered by physical exercise?", ["No", "Yes"], index=0)
                    inputs['exang'] = 1 if exang_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: exang</span>", unsafe_allow_html=True)
                    
                    inputs['ca'] = st.slider("Blocked Coronary Blood Vessels Count", 0, 4, 0, help="Number of main arteries found blocked under fluoroscopy.")
                    st.markdown("<span class='ref-badge'>Clinical: ca | Healthy: 0 Blocked</span>", unsafe_allow_html=True)
                with col_h6:
                    thal_lbl = st.selectbox("Heart Blood Flow Scan Status (Thalassemia)", ["Normal Scan", "Fixed flow defect (Old muscle damage)", "Reversible defect (Active blockage risk)"], index=1)
                    thal_map = {"Normal Scan": 1, "Fixed flow defect (Old muscle damage)": 2, "Reversible defect (Active blockage risk)": 3}
                    inputs['thal'] = thal_map[thal_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: thal</span>", unsafe_allow_html=True)
                
            elif d_name == "liver":
                st.markdown("<div class='panel-card-title'>🩺 Demographics & Baseline Vitals</div>", unsafe_allow_html=True)
                col_l1, col_l2 = st.columns(2)
                with col_l1:
                    inputs['Age'] = st.slider("Patient Age in Years", 1, 120, 45)
                    st.markdown("<span class='ref-badge'>Clinical: Age</span>", unsafe_allow_html=True)
                with col_l2:
                    gender_lbl = st.selectbox("Gender", ["Female", "Male"], index=1)
                    inputs['Gender'] = 1 if gender_lbl == "Male" else 0
                    st.markdown("<span class='ref-badge'>Clinical: Gender</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🧪 Bilirubin Bile Waste Panel</div>", unsafe_allow_html=True)
                col_l3, col_l4 = st.columns(2)
                with col_l3:
                    inputs['Total_Bilirubin'] = st.slider("Total Bilirubin (Yellow Bile Pigment) in mg/dl", 0.1, 80.0, 1.0, 0.1, help="Elevated suggests structural liver or bile duct blockages.")
                    st.markdown("<span class='ref-badge'>Clinical: Total_Bilirubin | Healthy: 0.1 - 1.2 mg/dl</span>", unsafe_allow_html=True)
                with col_l4:
                    inputs['Direct_Bilirubin'] = st.slider("Direct Bilirubin (Processed Bile Pigment) in mg/dl", 0.1, 40.0, 0.3, 0.1, help="Processed bile waste. High levels indicate cellular liver strain.")
                    st.markdown("<span class='ref-badge'>Clinical: Direct_Bilirubin | Healthy: 0.0 - 0.3 mg/dl</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🧪 Liver Enzymatic Activity (ALP, ALT, AST)</div>", unsafe_allow_html=True)
                col_l5, col_l6 = st.columns(2)
                with col_l5:
                    inputs['Alkaline_Phosphotase'] = st.slider("Liver Alkaline Enzyme (ALP) in IU/L", 10, 3000, 208, help="High levels suggests bone or bile duct strain.")
                    st.markdown("<span class='ref-badge'>Clinical: Alkaline_Phosphotase | Healthy: 44 - 147 IU/L</span>", unsafe_allow_html=True)
                    
                    inputs['Alamine_Aminotransferase'] = st.slider("Liver Cell Irritation Enzyme (ALT/SGPT) in IU/L", 10, 2000, 35, help="Liver-specific cell enzyme. Elevates quickly when hepatocytes are under stress.")
                    st.markdown("<span class='ref-badge'>Clinical: Alamine_Aminotransferase | Healthy: 7 - 56 IU/L</span>", unsafe_allow_html=True)
                with col_l6:
                    inputs['Aspartate_Aminotransferase'] = st.slider("Liver/Heart Activity Enzyme (AST/SGOT) in IU/L", 10, 5000, 42, help="High points to structural muscle or tissue damage.")
                    st.markdown("<span class='ref-badge'>Clinical: Aspartate_Aminotransferase | Healthy: 10 - 40 IU/L</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🧪 Synthesis & Blood Proteins Panel</div>", unsafe_allow_html=True)
                col_l7, col_l8 = st.columns(2)
                with col_l7:
                    inputs['Total_Protiens'] = st.slider("Total Blood Proteins in g/dl", 2.0, 10.0, 6.6, 0.1, help="Albumin and globulins combined.")
                    st.markdown("<span class='ref-badge'>Clinical: Total_Protiens | Healthy: 6.0 - 8.3 g/dl</span>", unsafe_allow_html=True)
                    
                    inputs['Albumin'] = st.slider("Albumin Protein level in g/dl", 0.9, 6.0, 3.1, 0.1, help="Essential blood protein created exclusively by liver.")
                    st.markdown("<span class='ref-badge'>Clinical: Albumin | Healthy: 3.5 - 5.0 g/dl</span>", unsafe_allow_html=True)
                with col_l8:
                    inputs['Albumin_and_Globulin_Ratio'] = st.slider("Albumin and Globulin Protein Ratio", 0.1, 3.0, 0.93, 0.01, help="Albumin/Globulin relationship. Lower maps chronic strain.")
                    st.markdown("<span class='ref-badge'>Clinical: Albumin_and_Globulin_Ratio | Healthy: 0.8 - 2.0</span>", unsafe_allow_html=True)
                
            elif d_name == "stroke":
                st.markdown("<div class='panel-card-title'>🩺 Demographics & Occupation</div>", unsafe_allow_html=True)
                col_s1, col_s2 = st.columns(2)
                with col_s1:
                    gender_lbl = st.selectbox("Biological Sex", ["Female", "Male", "Other"], index=0)
                    inputs['gender'] = {"Female": 0, "Male": 1, "Other": 2}[gender_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: gender</span>", unsafe_allow_html=True)
                    
                    inputs['age'] = st.slider("Patient Age in Years", 1.0, 120.0, 45.0, 1.0)
                    st.markdown("<span class='ref-badge'>Clinical: age</span>", unsafe_allow_html=True)
                with col_s2:
                    work_lbl = st.selectbox("Primary Occupation / Work Type", ["Government Employee", "Never Worked", "Private Sector", "Self-employed", "Student / Child"], index=2)
                    work_map = {"Government Employee": 0, "Never Worked": 1, "Private Sector": 2, "Self-employed": 3, "Student / Child": 4}
                    inputs['work_type'] = work_map[work_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: work_type</span>", unsafe_allow_html=True)
                    
                    residence_lbl = st.selectbox("Residence Location Area", ["Rural / Countryside", "Urban / City"], index=1)
                    inputs['Residence_type'] = 1 if residence_lbl == "Urban / City" else 0
                    st.markdown("<span class='ref-badge'>Clinical: Residence_type</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🩺 Systemic Health & Cardiovascular History</div>", unsafe_allow_html=True)
                col_s3, col_s4 = st.columns(2)
                with col_s3:
                    hyper_lbl = st.selectbox("Chronic High Blood Pressure History?", ["No", "Yes"], index=0)
                    inputs['hypertension'] = 1 if hyper_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: hypertension</span>", unsafe_allow_html=True)
                    
                    inputs['avg_glucose_level'] = st.slider("Average Blood Glucose (Sugar) level in mg/dl", 50.0, 300.0, 91.88, 0.1, help="Recent averages.")
                    st.markdown("<span class='ref-badge'>Clinical: avg_glucose_level | Healthy: Under 140 mg/dl</span>", unsafe_allow_html=True)
                with col_s4:
                    hd_lbl = st.selectbox("Heart Disease History?", ["No", "Yes"], index=0, help="Heart failure or vessel blockages.")
                    inputs['heart_disease'] = 1 if hd_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: heart_disease</span>", unsafe_allow_html=True)
                    
                    inputs['bmi'] = st.slider("Body Mass Index / Obesity Ratio (BMI)", 10.0, 90.0, 28.1, 0.1, help="Weight to height ratio.")
                    st.markdown("<span class='ref-badge'>Clinical: bmi | Healthy: 18.5 - 24.9</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🚬 Lifestyle Risk Profile</div>", unsafe_allow_html=True)
                col_s5, col_s6 = st.columns(2)
                with col_s5:
                    smoking_lbl = st.selectbox("Smoking History Status", ["Unknown / Not Disclosed", "Formerly Smoked (Quit)", "Never Smoked", "Active Smoker"], index=2)
                    smoking_map = {"Unknown / Not Disclosed": 0, "Formerly Smoked (Quit)": 1, "Never Smoked": 2, "Active Smoker": 3}
                    inputs['smoking_status'] = smoking_map[smoking_lbl]
                    st.markdown("<span class='ref-badge'>Clinical: smoking_status</span>", unsafe_allow_html=True)
                with col_s6:
                    married_lbl = st.selectbox("Ever Married?", ["No", "Yes"], index=1)
                    inputs['ever_married'] = 1 if married_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: ever_married</span>", unsafe_allow_html=True)
                
            elif d_name == "kidney":
                st.markdown("<div class='panel-card-title'>🩺 Patient Demographics & Vitals</div>", unsafe_allow_html=True)
                col_k1, col_k2 = st.columns(2)
                with col_k1:
                    inputs['age'] = st.slider("Patient Age in Years", 1, 120, 51)
                    st.markdown("<span class='ref-badge'>Clinical: age</span>", unsafe_allow_html=True)
                with col_k2:
                    inputs['bp'] = st.slider("Resting Lower Blood Pressure (Diastolic) in mm Hg", 50, 180, 80, help="Artery resting pressure.")
                    st.markdown("<span class='ref-badge'>Clinical: bp | Healthy: 60 - 80 mm Hg</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🧪 Urinalysis & Physical Urine Markers</div>", unsafe_allow_html=True)
                col_k3, col_k4 = st.columns(2)
                with col_k3:
                    sg_lbl = st.selectbox("Urine Specific Gravity (Density)", ["1.005", "1.010", "1.015", "1.020", "1.025"], index=3, help="Density indicates kidney waste dilution capabilities.")
                    inputs['sg'] = float(sg_lbl)
                    st.markdown("<span class='ref-badge'>Clinical: sg | Healthy: 1.010 - 1.025</span>", unsafe_allow_html=True)
                    
                    al_lbl = st.selectbox("Urine Protein level (Albumin Leakage)", ["0", "1", "2", "3", "4", "5"], index=1, help="Protein in urine. 0 is normal; 1-5 indicates worsening filtration leaks.")
                    inputs['al'] = int(al_lbl)
                    st.markdown("<span class='ref-badge'>Clinical: al | Normal: 0 (No Leakage)</span>", unsafe_allow_html=True)
                    
                    su_lbl = st.selectbox("Urine Sugar level (Glucose Leakage)", ["0", "1", "2", "3", "4", "5"], index=0, help="Sugar in urine. 0 is healthy; 1-5 indicates high systemic levels.")
                    inputs['su'] = int(su_lbl)
                    st.markdown("<span class='ref-badge'>Clinical: su | Normal: 0 (No Leakage)</span>", unsafe_allow_html=True)
                with col_k4:
                    rbc_lbl = st.selectbox("Urine Red Blood Cells Status", ["Healthy / Clear (Normal)", "Abnormal / Blood Present (Abnormal)"], index=0)
                    inputs['rbc'] = 0 if rbc_lbl == "Healthy / Clear (Normal)" else 1
                    st.markdown("<span class='ref-badge'>Clinical: rbc</span>", unsafe_allow_html=True)
                    
                    pc_lbl = st.selectbox("Urine Pus Cells Status (White Cells)", ["Healthy / Clear (Normal)", "Abnormal / Infection Signs (Abnormal)"], index=0)
                    inputs['pc'] = 0 if pc_lbl == "Healthy / Clear (Normal)" else 1
                    st.markdown("<span class='ref-badge'>Clinical: pc</span>", unsafe_allow_html=True)
                    
                    pcc_lbl = st.selectbox("Urine Pus Cell Clumps", ["Not Present (Healthy)", "Present (Active Infection)"], index=0)
                    inputs['pcc'] = 0 if pcc_lbl == "Not Present (Healthy)" else 1
                    st.markdown("<span class='ref-badge'>Clinical: pcc</span>", unsafe_allow_html=True)
                    
                    ba_lbl = st.selectbox("Urine Bacteria Status", ["Not Present (Healthy)", "Present (Bacterial infection)"], index=0)
                    inputs['ba'] = 0 if ba_lbl == "Not Present (Healthy)" else 1
                    st.markdown("<span class='ref-badge'>Clinical: ba</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🧪 Blood Hematology Panel</div>", unsafe_allow_html=True)
                col_k5, col_k6 = st.columns(2)
                with col_k5:
                    inputs['bgr'] = st.slider("Random Blood Glucose level in mg/dl", 20, 500, 121, help="Tested at any time.")
                    st.markdown("<span class='ref-badge'>Clinical: bgr | Healthy: Under 140 mg/dl</span>", unsafe_allow_html=True)
                    
                    inputs['bu'] = st.slider("Blood Urea level in mg/dl", 1, 400, 36, help="Kidney-filtered nitrogen waste product.")
                    st.markdown("<span class='ref-badge'>Clinical: bu | Healthy: 7 - 20 mg/dl</span>", unsafe_allow_html=True)
                    
                    inputs['sc'] = st.slider("Serum Creatinine level in mg/dl", 0.1, 40.0, 1.2, 0.1, help="Most critical muscle waste marker. Highly sensitive for filtration decline.")
                    st.markdown("<span class='ref-badge'>Clinical: sc | Healthy: 0.6 - 1.2 mg/dl</span>", unsafe_allow_html=True)
                    
                    inputs['sod'] = st.slider("Blood Sodium level in mEq/L", 50, 180, 138, help="Essential electrolyte sodium.")
                    st.markdown("<span class='ref-badge'>Clinical: sod | Healthy: 135 - 145 mEq/L</span>", unsafe_allow_html=True)
                    
                    inputs['pot'] = st.slider("Blood Potassium level in mEq/L", 1.0, 45.0, 4.4, 0.1, help="Critical heart electrolyte.")
                    st.markdown("<span class='ref-badge'>Clinical: pot | Healthy: 3.5 - 5.0 mEq/L</span>", unsafe_allow_html=True)
                with col_k6:
                    inputs['hemo'] = st.slider("Hemoglobin Level in g/dl", 3.0, 20.0, 12.5, 0.1, help="Oxygen carrying protein. Low indicates anemia.")
                    st.markdown("<span class='ref-badge'>Clinical: hemo | Healthy: 12.0 - 17.5 g/dl</span>", unsafe_allow_html=True)
                    
                    inputs['pcv'] = st.slider("Hematocrit / Packed Cell Volume (PCV)", 5, 60, 40, help="Blood volume percentage occupied by red cells. Low suggests anemia.")
                    st.markdown("<span class='ref-badge'>Clinical: pcv | Healthy: 36% - 50%</span>", unsafe_allow_html=True)
                    
                    inputs['wbcc'] = st.slider("White Blood Cell Count /cumm", 1000, 30000, 7800, 100, help="Immune cells. High suggests active infection.")
                    st.markdown("<span class='ref-badge'>Clinical: wbcc | Healthy: 4,500 - 11,000 /cumm</span>", unsafe_allow_html=True)
                    
                    inputs['rbcc'] = st.slider("Total Red Blood Cell Count (millions/cmm)", 1.0, 10.0, 4.8, 0.1, help="Total blood red cells. Low indicates anemia.")
                    st.markdown("<span class='ref-badge'>Clinical: rbcc | Healthy: 4.0 - 5.9 million/cmm</span>", unsafe_allow_html=True)
                
                st.markdown("<div class='panel-card-title'>🏥 Cardiovascular & Medical History</div>", unsafe_allow_html=True)
                col_k7, col_k8 = st.columns(2)
                with col_k7:
                    htn_lbl = st.selectbox("High Blood Pressure History (Hypertension)?", ["No", "Yes"], index=0)
                    inputs['htn'] = 1 if htn_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: htn</span>", unsafe_allow_html=True)
                    
                    dm_lbl = st.selectbox("Diabetes History?", ["No", "Yes"], index=0)
                    inputs['dm'] = 1 if dm_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: dm</span>", unsafe_allow_html=True)
                    
                    cad_lbl = st.selectbox("Coronary Artery Disease History?", ["No", "Yes"], index=0)
                    inputs['cad'] = 1 if cad_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: cad</span>", unsafe_allow_html=True)
                with col_k8:
                    appet_lbl = st.selectbox("Patient Appetite Level", ["Good Appetite", "Poor Appetite"], index=0)
                    inputs['appet'] = 0 if appet_lbl == "Good Appetite" else 1
                    st.markdown("<span class='ref-badge'>Clinical: appet</span>", unsafe_allow_html=True)
                    
                    pe_lbl = st.selectbox("Leg/Foot Swelling (Pedal Edema)?", ["No", "Yes"], index=0, help="Fluid buildup in legs caused by renal clearance declines.")
                    inputs['pe'] = 1 if pe_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: pe</span>", unsafe_allow_html=True)
                    
                    ane_lbl = st.selectbox("Anemia Diagnosis History?", ["No", "Yes"], index=0)
                    inputs['ane'] = 1 if ane_lbl == "Yes" else 0
                    st.markdown("<span class='ref-badge'>Clinical: ane</span>", unsafe_allow_html=True)
                
            submitted = st.form_submit_button("Generate Predictive Risk Diagnostic")
            
    with col_r:
        st.markdown("### Risk Analysis Output")
        
        if submitted:
            # Map input parameters in correct column order
            input_df = pd.DataFrame([inputs], columns=columns)
            
            # Scale clinical input using EMR standard scaler
            input_scaled = pd.DataFrame(scaler.transform(input_df), columns=columns)
            
            # Predict using scaled features
            prob = model.predict_proba(input_scaled)[0, 1]
            
            # Risk categorization
            if prob < 0.35:
                risk_level = "Low"
                gauge_color = "#059669" if st.session_state.light_mode else "#2ed573"
            elif prob < 0.70:
                risk_level = "Moderate"
                gauge_color = "#d97706" if st.session_state.light_mode else "#ff9f1a"
            else:
                risk_level = "High"
                gauge_color = "#dc2626" if st.session_state.light_mode else "#ff4d4d"
                
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
            
            # High-fidelity classification card
            st.markdown(f"""
            <div class='metric-card' style='text-align: center; border-color: {gauge_color}; border-width: 2px;'>
                <div class='metric-title'>Diagnostics Classification Result</div>
                <div class='metric-value' style='color: {gauge_color}; text-shadow: 0 0 12px {gauge_color}40;'>{risk_level} Risk</div>
                <div style='font-size: 2.8rem; font-weight: 800; margin: 10px 0; color: {text_color};'>{prob*100:.1f}%</div>
                <div style='color: {text_muted}; font-size: 0.8rem; font-weight: 500;'>Assigned EMR risk calculations for Patient:<br><b style='color: {text_color};'>{patient_name}</b> ({patient_id})</div>
            </div>
            """, unsafe_allow_html=True)
            
            # Real-time circular risk gauge (matches Light/Dark Mode)
            fig_gauge = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = prob * 100,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Calculated Risk Score (%)", 'font': {'color': text_muted, 'size': 13}},
                gauge = {
                    'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': text_muted},
                    'bar': {'color': gauge_color},
                    'bgcolor': "rgba(128, 128, 128, 0.08)",
                    'borderwidth': 1,
                    'bordercolor': card_border,
                    'steps': [
                        {'range': [0, 35], 'color': 'rgba(46, 213, 115, 0.12)'},
                        {'range': [35, 70], 'color': 'rgba(255, 159, 26, 0.12)'},
                        {'range': [70, 100], 'color': 'rgba(255, 77, 77, 0.12)'}
                    ]
                }
            ))
            fig_gauge.update_layout(
                template=plot_template,
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color=text_color),
                height=200,
                margin=dict(l=20, r=20, t=30, b=10)
            )
            st.plotly_chart(fig_gauge, use_container_width=True)
            
            # Interactive local explanation (SHAP Contributions)
            st.markdown("#### 🔍 Patient Clinical Risk Factors (SHAP)")
            shap_contribs = get_shap_contributions(model, scaler, input_df)
            
            # Build pretty titles
            shap_df = pd.DataFrame({
                'Feature': columns,
                'SHAP Value': shap_contribs,
                'Value': [inputs[col] if col in inputs else input_df[col].iloc[0] for col in columns]
            })
            
            # Pretty visual names mapping
            pretty_names = {
                'Pregnancies': 'Pregnancies', 'Glucose': 'Fasting Blood Sugar', 'BloodPressure': 'Diastolic BP', 
                'SkinThickness': 'Skin Fat Fold', 'Insulin': 'Insulin level', 'BMI': 'Body Mass Index', 
                'DiabetesPedigreeFunction': 'Family History score', 'Age': 'Patient Age', 'age': 'Patient Age', 
                'sex': 'Biological Sex', 'cp': 'Chest Pain Type', 'trestbps': 'Resting Systolic BP', 
                'chol': 'Total Cholesterol', 'fbs': 'Blood Sugar > 120', 'restecg': 'Resting ECG', 
                'thalach': 'Max Heart Rate', 'exang': 'Exercise Angina', 'oldpeak': 'Heart Strain oldpeak', 
                'slope': 'ECG Wave Slope', 'ca': 'Blocked Vessel Count', 'thal': 'Thalassemia flow', 
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
            
            shap_df['Feature Name'] = shap_df['Feature'].map(pretty_names).fillna(shap_df['Feature']) + " (" + shap_df['Value'].astype(str) + ")"
            shap_df = shap_df.sort_values(by='SHAP Value', key=abs, ascending=True)
            
            # Limit to top 10 factors for visual elegance
            shap_df = shap_df.tail(10)
            
            colors = ['#ff4d4d' if val >= 0 else '#2ed573' for val in shap_df['SHAP Value']]
            
            fig_shap = go.Figure(go.Bar(
                y=shap_df['Feature Name'],
                x=shap_df['SHAP Value'],
                orientation='h',
                marker_color=colors
            ))
            fig_shap.update_layout(
                template=plot_template,
                title={'text': "Impact on Risk score (Green: Lowers Risk | Red: Increases Risk)", 'font': {'size': 11, 'color': text_muted}},
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color=text_color),
                margin=dict(l=10, r=10, t=35, b=10),
                height=320,
                xaxis=dict(gridcolor=grid_color),
                yaxis=dict(gridcolor=grid_color)
            )
            st.plotly_chart(fig_shap, use_container_width=True)
            
            st.success("Risk computation completed successfully! You can review details in the Care Advisor or compile a PDF report.")
        else:
            st.info("Enter patient clinical values on the left and click 'Generate Predictive Risk' to run evaluations.")

# PAGE: EXPLAINABLE AI (SHAP)
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
        
        # Format names
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
        # Clear color background for theme consistency
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
        
        # Replace column names of X_test with layman friendly labels
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
        
        # Load dataset
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

# PAGE: RECOMMENDATIONS
elif st.session_state.page == "💡 Personalized Care Advisor":
    st.markdown("<div class='section-header'>💡 Dynamic Care Advisor Recommendations</div>", unsafe_allow_html=True)
    st.markdown("Actionable diagnostic advice dynamically generated based on the patient's calculated risk profiles.")
    
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
    
    # Check for active prediction
    if st.session_state.predictions:
        latest = st.session_state.predictions[-1]
        active_disease = latest['disease']
        active_risk = latest['risk_level']
        st.success(f"Loaded active diagnostics baseline: **{latest['patient_name']}** ({latest['disease']} — **{latest['risk_level']} Risk**)")
    else:
        st.info("No active diagnostic screenings in the current session. Select parameters below to inspect reference guidance:")
        sel_col1, sel_col2 = st.columns(2)
        with sel_col1:
            active_disease = st.selectbox("Diagnostics Domain", ["Diabetes", "Heart", "Liver", "Stroke", "Kidney"])
        with sel_col2:
            active_risk = st.selectbox("Assigned EMR Risk Severity", ["High", "Moderate", "Low"])
            
    recs = rec_database[active_disease][active_risk]
    
    priority_badges = {
        "High": ("🚨 CRITICAL PRIORITY CLINICAL ACTIONS", "#ff4d4d"),
        "Moderate": ("⚠️ HIGH PRIORITY MONITORING ACTIONS", "#ff9f1a"),
        "Low": ("✅ GENERAL LIFESTYLE CARE ACTIONS", "#2ed573")
    }
    badge_text, badge_color = priority_badges[active_risk]
    
    st.markdown(f"""
    <div style='background: {card_bg}; border-left: 5px solid {badge_color}; padding: 15px; border-radius: 8px; margin-bottom: 20px; {shadow_css}'>
        <h4 style='color: {badge_color}; margin: 0; font-size: 0.98rem; font-weight: 800;'>{badge_text}</h4>
        <p style='color: {text_muted}; font-size: 0.8rem; margin-top: 5px; margin-bottom: 0; font-weight: 500;'>Personalized advice synthesized for a <b>{active_risk} Risk</b> prediction model classification for <b>{active_disease}</b>.</p>
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

# PAGE: CLINICAL EMR REPORT GENERATOR
elif st.session_state.page == "📋 Clinical EMR Report":
    st.markdown("<div class='section-header'>📋 Export Diagnostic Clinical EMR Report</div>", unsafe_allow_html=True)
    st.markdown("Compile printable diagnostic medical reports summarizing patients history, risk diagnostics, and care advisor records.")
    
    if not st.session_state.predictions:
        st.warning("No screenings performed yet in this session. Complete a diagnostic profile screen first to generate a report.")
        st.stop()
        
    st.markdown("### 1. Patient EMR & Clinician Demographics")
    col_rep1, col_rep2 = st.columns(2)
    with col_rep1:
        rep_patient_name = st.text_input("Patient Full Name", value=st.session_state.predictions[-1]['patient_name'])
        rep_patient_id = st.text_input("Patient ID Number", value=st.session_state.predictions[-1]['patient_id'])
        rep_patient_age = st.number_input("Patient Age in Years", min_value=1, max_value=120, value=45)
    with col_rep2:
        rep_clinician = st.text_input("Responsible Diagnosing Clinician", value="Dr. Sarah Carter, MD")
        rep_date = st.date_input("Evaluation Report Date", value=datetime.date.today())
        rep_notes = st.text_area("Clinical Summary Diagnoses", value="Patient screened using ML diagnostic profiling for chronic diseases risk validation.")
        
    st.markdown("### 2. Diagnostics Elements Selection")
    
    selected_preds = []
    for idx, p in enumerate(st.session_state.predictions):
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
        
        # Compile bytes & serve download cleanly (duplicate key bug resolved!)
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
