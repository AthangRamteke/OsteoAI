# OsteoAI - Complete UI/UX & Architecture Modification Guide
**Step-by-Step Incremental Upgrade Roadmap**

---

## 📌 Overview & Strategy
This document outlines the step-by-step modification guide for **OsteoAI (AI-Powered Osteoporosis Risk Assessment System)**. 

> **Key Rule**: No full rewrite is needed. The existing project structure, context state management (`AssessmentContext.jsx`), and routing already provide a solid foundation. All updates are incremental refinements.

---

## 🛠️ Tech Stack & Dependencies

* **Frontend Framework**: React 19 + Vite
* **UI Component Library**: Material-UI (MUI v6 / v9)
* **Animation Engine**: Framer Motion
* **Data Visualization**: Recharts
* **State Management**: React Context API (`AssessmentContext`)
* **HTTP Client**: Axios
* **Backend (Upcoming)**: FastAPI + Python 3.11
* **Machine Learning**: Scikit-Learn (XGBoost / Random Forest) + SHAP (Explainable AI)

---

## 🚀 Step-by-Step Implementation Plan

### Step 1: Create Reusable Selection Tile Component
* **Target File**: `src/components/ui/SelectableCard.jsx` *(NEW)*
* **Purpose**: Replace plain radio buttons with modern clickable cards across all forms.

#### Component Specifications:
* **Props**: `{ selected, onClick, icon, title, subtitle }`
* **Unselected State**:
  * White background (`#FFFFFF`)
  * Light-gray border (`1px solid #E2E8F0`)
* **Selected State**:
  * Soft blue background (`#EEF4FF`)
  * Electric blue border (`2px solid #2563EB`)
  * Active check icon (`CheckCircleIcon`) on the right
  * Soft elevation glow (`0 4px 12px rgba(37,99,235,0.12)`)

```jsx
// src/components/ui/SelectableCard.jsx
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function SelectableCard({ selected, onClick, icon, title, subtitle }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: selected ? "2px solid #2563EB" : "1px solid #E2E8F0",
        bgcolor: selected ? "#EEF4FF" : "white",
        boxShadow: selected ? "0 4px 12px rgba(37,99,235,0.12)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "&:hover": {
          borderColor: "#2563EB",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon && <Box sx={{ fontSize: "1.3rem" }}>{icon}</Box>}
        <Box>
          <Typography fontWeight={selected ? 700 : 500} color="text.primary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {selected && <CheckCircleIcon color="primary" fontSize="small" />}
    </Box>
  );
}

export default SelectableCard;
```

---

### Step 2: Upgrade Form Steps & Animations

#### A. LifestyleForm.jsx (`src/components/assessment/LifestyleForm.jsx`)
* Replace `<RadioGroup>` with a responsive Grid of `<SelectableCard>` components.
* **Fields & Options**:
  * **Physical Activity**:
    * `Low`: Little to no regular exercise
    * `Moderate`: Exercise 1–3 days per week *(Recommended target)*
    * `High`: Exercise 4+ days per week
  * **Smoking Status**:
    * `Never`
    * `Former`
    * `Current`
  * **Alcohol Intake**:
    * `Never`
    * `Occasionally` (1–2 units occasionally)
    * `Frequently` (Regular / High intake)

#### B. MedicalHistoryForm.jsx (`src/components/assessment/MedicalHistoryForm.jsx`)
* Implement 3-tile selection rows: `[ No | Yes | Not Sure ]` for each clinical question.
* **Key Medical Risk Factors**:
  1. **Family History of Osteoporosis** (Parental / Sibling history)
  2. **Previous Bone Fracture** (Fragility fracture from minor trauma after age 45)
  3. **Long-Term Steroid Use** (Corticosteroids like Prednisone for >3 months)
  4. **Secondary Risk Factors** (Rheumatoid arthritis, hyperthyroidism, type 1/2 diabetes)

#### C. Assessment.jsx (`src/pages/Assessment/Assessment.jsx`)
* Wrap the active step inside Framer Motion's `<AnimatePresence>` to create smooth horizontal slide-in and slide-out transitions.

```jsx
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence mode="wait">
  <motion.div
    key={activeStep}
    initial={{ opacity: 0, x: 25 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -25 }}
    transition={{ duration: 0.25 }}
  >
    {steps[activeStep]}
  </motion.div>
</AnimatePresence>
```

---

### Step 3: Upgrade Assessment Results to Visual Dashboard
* **Target File**: `src/components/assessment/AssessmentResult.jsx` *(MODIFY)*

#### 1. Overall Risk Score Gauge (Left Card)
* Circular half-donut gauge / speed meter displaying:
  * Calculated Osteoporosis Risk: `Moderate Risk (Score: 0.58 / 1.00)`
  * Risk Breakdown Progress Bars:
    * Personal Factors: `0.35`
    * Lifestyle Factors: `0.62`
    * Medical Factors: `0.71`
  * Color-coded pill badges:
    * **Key Risk Drivers (Red)**: Low Calcium Intake, Family History, Sedentary Lifestyle
    * **Protective Factors (Green)**: Normal BMI, Non-smoker, Moderate Alcohol

#### 2. Explainable AI (SHAP) Chart (Center-Right Card)
* Horizontal bar chart built with `recharts` (`<BarChart layout="vertical">`):
  * **Red Bars ($\rightarrow$)**: Factors increasing risk (`+0.28 Family History`, `+0.21 Low Calcium`, `+0.16 Sedentary`, `+0.08 Age`)
  * **Green Bars ($\leftarrow$)**: Factors reducing risk (`-0.12 Normal BMI`, `-0.09 Non-Smoker`)

#### 3. Interactive "What-If" Lifestyle Simulator (Bottom Card)
* Interactive sliders for:
  * **Weekly Exercise**: `0 to 7 days`
  * **Calcium Intake**: `400 to 1800 mg/day`
  * **Smoking Cessation**: `[Never | Former | Current]`
* Dynamic live calculation showing projected risk reduction: `↓ 18% Potential Improvement`.

#### 4. Actionable Recommendations & 1-Click PDF Export
* Structured recommendation cards:
  * Increase Weight-bearing Exercise
  * Improve Calcium & Vitamin D Intake
  * Consider DXA Bone Density Scan
  * Maintain Healthy Lifestyle
* **1-Click Download PDF** button generating a clean patient summary report.

---

### Step 4: Quick Landing Page Polish

#### A. AboutSection.jsx (`src/components/landing/AboutSection.jsx`)
* Fix the React 19 prop warning by moving `alignItems` inside `sx`:
  * `<Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>`
  * `<Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: "center" }}>`

#### B. Hero.jsx (`src/components/landing/Hero.jsx`)
* Add ambient radial glow:
  ```jsx
  sx={{
    background: "radial-gradient(1000px circle at 80% 20%, rgba(37,99,235,0.06) 0%, #F8FAFC 100%)",
  }}
  ```

---

### Step 5: Backend & Machine Learning Pipeline (FastAPI)

#### A. FastAPI Backend (`backend/main.py`)
* Configure FastAPI with CORS middleware for Vite client (`http://localhost:5173`).
* Define Pydantic models matching `assessmentData`:
  * `PersonalInfoSchema` (age, gender, height, weight)
  * `LifestyleSchema` (activity, smoking, alcohol)
  * `MedicalHistorySchema` (familyHistory, previousFracture, medications)
* Create `POST /api/predict` endpoint returning:
  * `riskScore` (Float 0.0 - 1.0)
  * `riskLevel` ("Low" | "Moderate" | "High")
  * `shapValues` (Array of `{ feature, contribution, direction }`)
  * `recommendations` (Array of actionable advice strings)

#### B. Machine Learning Model Training
* Train classifier (XGBoost / Random Forest) on clinical osteoporosis dataset.
* Fit `shap.TreeExplainer` on the model to generate feature attribution vectors for inference.

#### C. Frontend API Integration (`src/services/api.js`)
* Connect frontend `onSubmit` in `Assessment.jsx` to FastAPI backend using `axios`.

---

## 📋 Comprehensive Action Item Checklist

```markdown
- [ ] 1. Create `src/components/ui/SelectableCard.jsx`
- [ ] 2. Refactor `LifestyleForm.jsx` to use `SelectableCard` grid
- [ ] 3. Refactor `MedicalHistoryForm.jsx` with 3-tile `[No | Yes | Not Sure]` cards
- [ ] 4. Wrap steps in `Assessment.jsx` with Framer Motion `AnimatePresence`
- [ ] 5. Upgrade `AssessmentResult.jsx` with Recharts SHAP bar chart & What-If Simulator
- [ ] 6. Fix `AboutSection.jsx` `alignItems` sx prop warning
- [ ] 7. Add ambient radial background glow to `Hero.jsx`
- [ ] 8. Set up FastAPI backend (`backend/main.py`) with `POST /api/predict`
- [ ] 9. Train ML model + SHAP explainer and connect via Axios service
```
