import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import shap

# Create folders if not exist
os.makedirs('models', exist_ok=True)
os.makedirs('shap_files', exist_ok=True)

# ------------------------------------------------------------
# 1. PREPROCESSING SCHEMAS & MAPPINGS
# ------------------------------------------------------------

def preprocess_diabetes(df):
    # Features: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age
    # Target: Outcome (0 or 1)
    X = df.drop(columns=['Outcome'])
    y = df['Outcome']
    return X, y

def preprocess_heart(df):
    # Features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    # Target: target (0 or 1)
    X = df.drop(columns=['target'])
    y = df['target']
    return X, y

def preprocess_liver(df):
    # Fill missing Albumin_and_Globulin_Ratio with column median
    median_ratio = df['Albumin_and_Globulin_Ratio'].median()
    df['Albumin_and_Globulin_Ratio'] = df['Albumin_and_Globulin_Ratio'].fillna(median_ratio)
    
    # Map Gender: Female -> 0, Male -> 1
    df['Gender'] = df['Gender'].map({'Female': 0, 'Male': 1}).fillna(1).astype(int)
    
    # Map Target Dataset: 1 (liver disease) -> 1, 2 (no disease) -> 0
    df['target'] = df['Dataset'].map({1: 1, 2: 0})
    
    X = df.drop(columns=['Dataset', 'target'])
    y = df['target']
    return X, y

def preprocess_stroke(df):
    # Drop ID column
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
        
    # Impute BMI with median
    median_bmi = df['bmi'].median()
    df['bmi'] = df['bmi'].fillna(median_bmi)
    
    # Map categorical features to integers
    gender_map = {'Male': 1, 'Female': 0, 'Other': 2}
    df['gender'] = df['gender'].map(gender_map).fillna(0).astype(int)
    
    married_map = {'No': 0, 'Yes': 1}
    df['ever_married'] = df['ever_married'].map(married_map).fillna(0).astype(int)
    
    work_map = {'Govt_job': 0, 'Never_worked': 1, 'Private': 2, 'Self-employed': 3, 'children': 4}
    df['work_type'] = df['work_type'].map(work_map).fillna(2).astype(int)
    
    residence_map = {'Rural': 0, 'Urban': 1}
    df['Residence_type'] = df['Residence_type'].map(residence_map).fillna(1).astype(int)
    
    smoking_map = {'Unknown': 0, 'formerly smoked': 1, 'never smoked': 2, 'smokes': 3}
    df['smoking_status'] = df['smoking_status'].map(smoking_map).fillna(2).astype(int)
    
    X = df.drop(columns=['stroke'])
    y = df['stroke']
    return X, y

# ------------------------------------------------------------
# 2. MODEL TRAINING LOOP
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
    }
}

metrics_summary = {}

for name, config in datasets.items():
    print(f"\nProcessing {name} dataset...")
    # Load dataset
    df = pd.read_csv(config['path'], encoding='utf-8-sig')
    
    # Preprocess
    X, y = config['preprocess'](df)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Train model (Random Forest Classifier)
    # Balanced class weights handles class imbalances (especially stroke)
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    
    # Predict and evaluate
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    print(f"Metrics for {name}:")
    print(f"  Accuracy : {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall   : {recall:.4f}")
    print(f"  F1-Score : {f1:.4f}")
    print(f"  ROC-AUC  : {roc_auc:.4f}")
    
    # Save model and components
    joblib.dump(model, f'models/{name}_model.joblib')
    joblib.dump(X.columns.tolist(), f'models/{name}_columns.joblib')
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
    
    # Generate SHAP values for the test set and pre-save summaries to accelerate Streamlit EAI page
    print(f"Generating SHAP values for {name}...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)
    
    # Save explainer object
    joblib.dump(explainer, f'shap_files/{name}_explainer.joblib')
    joblib.dump(shap_values, f'shap_files/{name}_shap_values.joblib')
    joblib.dump(X_test, f'shap_files/{name}_X_test.joblib')

# Save all metrics to JSON
with open('models/model_metrics.json', 'w') as f:
    json.dump(metrics_summary, f, indent=4)

print("\nModel training, serialization, and SHAP pre-computation completed successfully!")
