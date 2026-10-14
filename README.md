# 🦴 OsteoAI

AI-powered osteoporosis risk assessment built with React, a supervised machine-learning model, explainable AI (SHAP), and a locally hosted AI health assistant.

OsteoAI is an academic research prototype. It produces a model-based **risk estimate**, not a medical diagnosis, and has not been clinically validated.

---

## What it does

| Area | Description |
|---|---|
| **Assessment** | Personal, lifestyle and medical-history questions, or autofill by uploading a report (PDF, Word, image). |
| **Prediction** | A frozen scikit-learn pipeline estimates an osteoporosis probability and maps it to a Low / Moderate / High risk level. |
| **Explainability** | SHAP shows which answers pushed the estimate up or down for that specific person. |
| **AI Assistant** | A local LLM explains results, answers bone-health questions, and helps with the app, in natural language. |
| **Assessment History** | Timeline of past assessments with a trend chart, side-by-side comparison, and read-only re-opening of any result. |
| **Knowledge & Support** | Searchable articles, myth-or-fact cards, glossary and FAQ. The assistant answers from this same library. |
| **What-if Simulator** | Change a lifestyle input and compare two model estimates. A hypothetical comparison, never a causal claim. |
| **Reminders** | Ask the assistant to remind you; it is created only after you confirm, and announced by desktop notification. |
| **Languages** | English, Hindi and Marathi across the interface, the knowledge base and the assistant's replies. |

---

## Architecture

```
React (Vite + MUI)
   │  /api/predict, /api/extract-document, /api/agent/chat(/stream),
   │  /api/knowledge, /api/simulate
   ▼
FastAPI backend
   ├── services/predictor.py ...... frozen ML pipeline + SHAP
   ├── services/document_extractor.py  conservative extraction for review
   ├── knowledge/ ................. multilingual knowledge base (also used for retrieval)
   └── agent/
        ├── intent.py ............. deterministic routing for app actions
        ├── prompt.py ............. system prompt + result / history / document / knowledge context
        ├── reminders.py .......... date parsing and confirmation copy
        └── llm.py ................ provider chain: Gemini → Grok → local Qwen
                                     ▼
                              Ollama (qwen3.5:4b) on the same machine
```

**The model predicts, SHAP explains, the Agent communicates.** The LLM never produces the risk estimate; it only puts the model's own output into words.

---

## Running it

### 1. Backend

```bash
pip install -r backend/requirements.txt
```

```bash
cd backend && uvicorn app.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

### 2. Local AI model

Install [Ollama](https://ollama.com), then:

```bash
ollama pull qwen3.5:4b
```

Ollama starts with Windows and loads the model on the first chat message (a few seconds). Nothing else is needed; the assistant works offline.

Optional cloud fallbacks: copy `backend/.env.example` to `backend/.env` and add `GEMINI_API_KEY` or `GROK_API_KEY`. Missing or expired keys are skipped automatically and the local model answers instead.

### 3. Frontend

```bash
npm install
```

```bash
npm run dev
```

App: `http://localhost:5173`

---

## Agent boundaries

These rules are enforced in the prompt and in code, not left to the model:

- **Read, explain and navigate** happen immediately.
- **Create or change** always needs explicit confirmation. A reminder is shown in full and created only after the user agrees.
- The assistant never diagnoses, prescribes, or invents model factors.
- Possible emergencies get an urgent-care notice added by the backend, independently of the model.
- Extracted document values stay candidates until the user confirms them.

---

## Data and privacy

Assessments, history, reminders, documents and chat transcripts are stored **in the browser on that device**; clearing site data removes them. When the local model answers, the conversation never leaves the machine. Cloud providers, if configured, do receive the conversation.

---

## Known limitations

- Research prototype on survey-trained data; not clinically validated.
- Reminder alerts need the browser running. Chrome no longer supports scheduled notification triggers, so delivery with the browser fully closed would require Web Push and a backend scheduler.
- The local 4B model is fast but less accurate than the cloud providers; its answers are grounded in the result data and knowledge base to reduce that risk.
