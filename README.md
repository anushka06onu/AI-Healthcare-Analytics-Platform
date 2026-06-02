# 🏥 AI Healthcare Analytics Platform

A premium, AI-powered healthcare analytics platform for disease prediction, explainable AI, comprehensive analytics, PDF report generation, and personalized health recommendations.

![Platform](https://img.shields.io/badge/Platform-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-cyan)

## ✨ Features

### 📊 Dashboard
- Real-time overview with animated statistics
- Disease distribution charts
- Monthly prediction trends
- Recent predictions table with risk badges
- Quick-action navigation

### 🔬 Disease Prediction
AI-powered risk assessment for four major diseases:
- **Diabetes** — 8 clinical parameters (Glucose, BMI, Age, etc.)
- **Heart Disease** — 12 cardiovascular indicators
- **Liver Disease** — 10 liver function markers
- **Stroke** — 10 cerebrovascular risk factors

Each predictor features:
- Interactive input forms with clinical parameter ranges
- Weighted scoring algorithms based on medical thresholds
- Visual risk gauge with confidence percentages
- Risk factor contribution charts

### 🧠 Explainable AI
- **SHAP Values** — Waterfall charts showing feature contributions (positive/negative)
- **Feature Importance** — Ranked horizontal bar charts per disease model
- Disease model selector with interactive explanations
- Color-coded impact visualization

### 📈 Analytics
Three comprehensive views:
- **Disease Insights** — Prevalence stats, age/gender distributions, comorbidity matrix
- **Risk Factors** — Cross-disease analysis, population risk distribution, radar charts
- **Trends** — Model accuracy over time, seasonal patterns, prediction volume

### 📄 Report Generator
- Configurable patient information
- Disease assessment selection
- Formatted report preview
- **PDF Export** with complete analysis summary
- Includes recommendations and medical disclaimers

### 💡 Recommendation System
- Personalized health recommendations based on prediction results
- Categorized: Medical, Diet, Exercise, Lifestyle, Monitoring
- Priority-based: Critical → Important → Suggested
- Disease-specific action items
- General wellness guidelines

## 🛠 Technology Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic structure |
| Vanilla CSS | Dark glassmorphism design system |
| Vanilla JavaScript | Application logic, SPA routing |
| Chart.js | Interactive data visualizations |
| jsPDF + html2canvas | Client-side PDF generation |
| Lucide Icons | Modern icon set |
| Google Fonts (Inter) | Premium typography |

## 🚀 Getting Started

No build step required! Simply:

```bash
# Clone the repository
git clone https://github.com/anushka06onu/AI-Healthcare-Analytics-Platform.git

# Open in browser
open index.html
```

Or use a local server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
AI-Healthcare-Analytics-Platform/
├── index.html                    # Main HTML (SPA shell)
├── css/
│   └── index.css                 # Design system & all styles
├── js/
│   ├── app.js                    # SPA router, state, utilities
│   ├── dashboard.js              # Dashboard module
│   ├── diseases/
│   │   ├── diabetes.js           # Diabetes prediction
│   │   ├── heart.js              # Heart disease prediction
│   │   ├── liver.js              # Liver disease prediction
│   │   └── stroke.js             # Stroke prediction
│   ├── explainableAI.js          # SHAP & Feature Importance
│   ├── analytics.js              # Analytics (3 tabs)
│   ├── reportGenerator.js        # PDF report generation
│   └── recommendations.js        # Health recommendations
└── README.md
```

## 🎨 Design

- **Theme**: Dark mode with glassmorphism (frosted glass cards)
- **Color Palette**: Deep navy backgrounds, cyan/teal accents, warm amber warnings, rose alerts
- **Typography**: Inter font family with fluid sizing
- **Animations**: Smooth page transitions, animated counters, chart reveals, hover micro-interactions
- **Responsive**: Full mobile support with collapsible sidebar

## ⚠️ Disclaimer

> **This platform is for educational and demonstration purposes only.**
> The disease predictions use simulated scoring algorithms based on medical thresholds — they are **NOT** trained machine learning models.
> This tool should **NEVER** be used as a substitute for professional medical advice, diagnosis, or treatment.
> Always consult a qualified healthcare provider for medical decisions.

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using AI Healthcare Analytics