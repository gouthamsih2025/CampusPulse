# CampusPulse 🚀
> Intelligent Campus Operations & Issue-Management Platform

CampusPulse is a modern, full-stack web application that allows students and staff to report campus infrastructure and operational issues, while providing campus administrators with an operations dashboard for ticket assignment, severity triage, lifecycle tracking, and recurring-issue analytics.

---

## 🌟 Key Highlights
- **End-to-End Type Safety**: Next.js 14 App Router (TypeScript) + FastAPI (Pydantic v2 & SQLAlchemy 2.0).
- **Graceful AI Triage**: Auto-extracts category, building, room, and severity from natural language with zero-cost deterministic fallback when no LLM API key is supplied.
- **Operational Analytics**: Heatmaps, breakdown frequencies, and resolution metrics.
- **Zero-Friction Local Setup**: Ready for local execution with out-of-the-box SQLite fallback and production PostgreSQL compatibility.

---

## 🏗️ Tech Stack
- **Frontend**: Next.js 14+, React 18/19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy 2.0, Uvicorn
- **Database**: PostgreSQL (Production) / SQLite (Local dev zero-config)
- **AI / NLP**: Google Gemini API / OpenAI API with deterministic heuristic fallback

---

## 📁 Repository Structure
```text
CampusPulse/
├── frontend/                  # Next.js Application (App Router)
│   ├── src/
│   │   ├── app/               # Pages & Layouts (Home, Report, Track, Admin, Analytics)
│   │   ├── components/        # Reusable UI widgets & modals
│   │   ├── lib/               # API clients & utilities
│   │   └── types/             # TypeScript type definitions
│   └── package.json
├── backend/                   # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/            # REST API route handlers
│   │   ├── core/              # Config, DB session & settings
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic schemas (Validation)
│   │   ├── services/          # Business logic & AI Triage service
│   │   └── main.py            # API entry point
│   ├── seed_data.py           # Sample campus data seeder
│   └── requirements.txt
├── docs/                      # Technical docs, architecture, Postman collection
├── .env.example               # Environment variables template
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
py -m venv venv
venv\Scripts\activate       # On Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python seed_data.py         # Seeds initial categories and sample tickets
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web application will be live at: `http://localhost:3000`
