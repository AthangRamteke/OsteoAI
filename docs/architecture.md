# OsteoAI - System Architecture

## Overall System Workflow

```
                    ┌────────────────────┐
                    │       User         │
                    └─────────┬──────────┘
                              │
                              ▼
              ┌───────────────────────────┐
              │ React Frontend (Material UI) │
              └─────────┬─────────────────┘
                        │
                        ▼
        ┌────────────────────────────────────┐
        │ Multi-Step Health Assessment        │
        │                                    │
        │ • Personal Information             │
        │ • Lifestyle Assessment             │
        │ • Medical History                  │
        └──────────────┬─────────────────────┘
                       │
                       ▼
        ┌────────────────────────────────────┐
        │ BMI & Initial Health Analysis      │
        │                                    │
        │ • BMI Calculation                  │
        │ • BMI Category                     │
        │ • Risk Indicator                   │
        │ • Health Recommendation            │
        └──────────────┬─────────────────────┘
                       │
                       ▼
              ┌──────────────────────┐
              │ FastAPI Backend       │
              │ (Upcoming)            │
              └─────────┬─────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│ PostgreSQL       │           │ Machine Learning │
│ Database         │           │ Prediction Model │
└────────┬─────────┘           └────────┬─────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
          ┌──────────────────────────────┐
          │ Osteoporosis Risk Prediction │
          └──────────────┬───────────────┘
                         ▼
          ┌──────────────────────────────┐
          │ Explainable AI (SHAP)        │
          │ (Upcoming)                   │
          └──────────────┬───────────────┘
                         ▼
          ┌──────────────────────────────┐
          │ AI Health Assistant          │
          │ Personalized Recommendations │
          └──────────────┬───────────────┘
                         ▼
          ┌──────────────────────────────┐
          │ Final Health Report          │
          │ PDF Download (Upcoming)      │
          └──────────────────────────────┘
```

---

# Current Development Status

## Completed

- React Frontend
- Material UI
- Personal Information Form
- BMI Calculation
- BMI Category
- Bone Health Summary
- Risk Indicator
- Health Recommendation

---

## In Progress

- Lifestyle Assessment
- Medical History Assessment

---

## Upcoming

- FastAPI Backend
- PostgreSQL Database
- Machine Learning Model
- Explainable AI (SHAP)
- AI Health Assistant
- PDF Report Generation

---

# Development Progress

Overall Progress:
**30–35% Completed**

Current Phase:
**Frontend Assessment Module**

Next Phase:
**Complete User Assessment Forms before Machine Learning Integration**