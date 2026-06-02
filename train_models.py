import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import shap

# Create folders if not exist
os.makedirs('models', exist_ok=True)
os.makedirs('shap_files', exist_ok=True)

# ------------------------------------------------------------
# 1. PREPROCESSING SCHEMAS & MAPPINGS
# ------------------------------------------------------------

def preprocess_diabetes(df):
    X = df.drop(columns=['Outcome'])
    y = df['Outcome']
    return X, y

def preprocess_heart(df):
    X = df.drop(columns=['target'])
    y = df['target']
    return X, y

def preprocess_liver(df):
    median_ratio = df['Albumin_and_Globulin_Ratio'].median()
    df['Albumin_and_Globulin_Ratio'] = df['Albumin_and_Globulin_Ratio'].fillna(median_ratio)
    
    df['Gender'] = df['Gender'].map({'Female': 0, 'Male': 1}).fillna(1).astype(int)
    df['target'] = df['Dataset'].map({1: 1, 2: 0})
    
    X = df.drop(columns=['Dataset', 'target'])
    y = df['target']
    return X, y

def preprocess_stroke(df):
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
        
    median_bmi = df['bmi'].median()
    df['bmi'] = df['bmi'].fillna(median_bmi)
    
    gender_map = {'Male': 1, 'Female': 0, 'Other': 2}
    df['gender'] = df['gender'].map(gender_map).fillna(0).astype(int)
    
    married_map = {'No': 0, 'Yes': 1}
    df['ever_married'] = df['ever_married'].map(married_map).fillna(0).astype(int)
    
    work_map = {'Government Job': 0, 'Govt_job': 0, 'Never_worked': 1, 'Private': 2, 'Self-employed': 3, 'children': 4}
    df['work_type'] = df['work_type'].map(work_map).fillna(2).astype(int)
    
    residence_map = {'Rural': 0, 'Urban': 1}
    df['Residence_type'] = df['Residence_type'].map(residence_map).fillna(1).astype(int)
    
    smoking_map = {'Unknown': 0, 'formerly smoked': 1, 'never smoked': 2, 'smokes': 3}
    df['smoking_status'] = df['smoking_status'].map(smoking_map).fillna(2).astype(int)
    
    X = df.drop(columns=['stroke'])
    y = df['stroke']
    return X, y

def preprocess_kidney(df):
    df = df.replace('?', np.nan)
    
    num_cols = ['age', 'bp', 'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wbcc', 'rbcc', 'sg', 'al', 'su']
    for col in num_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].median())
        
    binary_cols = {
        'rbc': {'normal': 0, 'abnormal': 1},
        'pc': {'normal': 0, 'abnormal': 1},
        'pcc': {'notpresent': 0, 'present': 1},
        'ba': {'notpresent': 0, 'present': 1},
        'htn': {'no': 0, 'yes': 1},
        'dm': {'no': 0, 'yes': 1},
        'cad': {'no': 0, 'yes': 1},
        'pe': {'no': 0, 'yes': 1},
        'ane': {'no': 0, 'yes': 1},
        'appet': {'good': 0, 'poor': 1}
    }
    
    for col, mapping in binary_cols.items():
        df[col] = df[col].str.strip() if df[col].dtype == object else df[col]
        df[col] = df[col].map(mapping)
        mode_val = df[col].mode()[0] if not df[col].mode().empty else 0
        df[col] = df[col].fillna(mode_val).astype(int)
        
    df['classification'] = df['classification'].str.strip()
    df['target'] = df['classification'].map({'ckd': 1, 'notckd': 0})
    
    X = df.drop(columns=['classification', 'target'])
    y = df['target']
    return X, y

# ------------------------------------------------------------
# 2. METRICS GENERATION & SHAP PRE-COMPUTATION
# ------------------------------------------------------------

datasets = {
    'diabetes': {
        'path': 'data/diabetes.csv',
        'preprocess': preprocess_diabetes
    },
    'heart': {
        'path': 'data/heart.csv',
        'preprocess': preprocess_heart
    },
    'liver': {
        'path': 'data/liver.csv',
        'preprocess': preprocess_liver
    },
    'stroke': {
        'path': 'data/stroke.csv',
        'preprocess': preprocess_stroke
    },
    'kidney': {
        'path': 'data/kidney.csv',
        'preprocess': preprocess_kidney
    }
}

metrics_summary = {}

for name, config in datasets.items():
    print(f"\nProcessing {name} dataset using your pre-trained models...")
    
    # Load dataset
    df = pd.read_csv(config['path'], encoding='utf-8-sig')
    
    # Preprocess
    X, y = config['preprocess'](df)
    
    # Load pre-trained EMR model and scaler
    model = joblib.load(f'models/{name}_model.pkl')
    scaler = joblib.load(f'models/{name}_scaler.pkl')
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale X_train and X_test using your pre-trained scaler
    X_train_scaled = pd.DataFrame(scaler.transform(X_train), columns=X.columns)
    X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X.columns)
    
    # Predict and evaluate
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    print(f"Metrics for {name} (Pre-trained model):")
    print(f"  Accuracy : {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall   : {recall:.4f}")
    print(f"  F1-Score : {f1:.4f}")
    print(f"  ROC-AUC  : {roc_auc:.4f}")
    
    # Save column features and raw X_train baseline
    joblib.dump(list(scaler.feature_names_in_), f'models/{name}_columns.joblib')
    joblib.dump(X_train, f'models/{name}_X_train.joblib')
    
    # Save metrics summary
    metrics_summary[name] = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1': float(f1),
        'roc_auc': float(roc_auc),
        'samples': len(df),
        'positive_prevalence': float(y.mean())
    }
    
    # Pre-calculate SHAP values for the test set
    print(f"Pre-calculating SHAP values for {name}...")
    model_class = model.__class__.__name__
    
    if "RandomForest" in model_class:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test_scaled)
        
        # Save explainer components
        joblib.dump(explainer, f'shap_files/{name}_explainer.joblib')
        joblib.dump(shap_values, f'shap_files/{name}_shap_values.joblib')
        joblib.dump(X_test_scaled, f'shap_files/{name}_X_test.joblib')
    else:
        # XGBoost models: use KernelExplainer and save the baseline + test sample values
        test_sample = shap.sample(X_test_scaled, min(100, len(X_test_scaled)))
        bg_sample = shap.sample(X_train_scaled, min(30, len(X_train_scaled)))
        
        explainer = shap.KernelExplainer(model.predict_proba, bg_sample)
        shap_values = explainer.shap_values(test_sample)
        
        # Save pre-computed SHAP matrices. We dump None as explainer to avoid Cython MemoryView serialization crash
        joblib.dump(None, f'shap_files/{name}_explainer.joblib')
        joblib.dump(shap_values, f'shap_files/{name}_shap_values.joblib')
        joblib.dump(test_sample, f'shap_files/{name}_X_test.joblib')

# Save all metrics to JSON
with open('models/model_metrics.json', 'w') as f:
    json.dump(metrics_summary, f, indent=4)

print("\nSHAP pre-computation and EMR metrics synchronization completed successfully for all 5 pre-trained models!")
