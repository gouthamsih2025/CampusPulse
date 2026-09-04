# CampusPulse — Production Deployment & Operations Guide

## 1. Local Testing & Verification

### Run Backend
```bash
cd D:\Development\Projects\CampusPulse\backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- Test API Docs: `http://localhost:8000/docs`

### Run Frontend
```bash
cd D:\Development\Projects\CampusPulse\frontend
npm install
npm run dev
```
- Open App: `http://localhost:3000`

---

## 2. Pushing to GitHub

1. Initialize Git in the root directory:
```bash
cd D:\Development\Projects\CampusPulse
git init
git add .
git commit -m "feat: complete CampusPulse full-stack platform with AI triage & analytics"
```
2. Create a new GitHub repository called `CampusPulse`.
3. Push to GitHub:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/CampusPulse.git
git branch -M main
git push -u origin main
```

---

## 3. Deploying the PostgreSQL Database & Backend (Render / Railway)

### Option A: Render (Recommended Free Tier)
1. Go to [Render.com](https://render.com) and click **New +** $\rightarrow$ **Blueprint**.
2. Connect your `CampusPulse` GitHub repository.
3. Render will read `render.yaml` and provision:
   - Managed PostgreSQL database
   - Python FastAPI web service
4. Under Environment Variables of the Web Service, add:
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key.
5. Copy the live Backend URL (e.g., `https://campuspulse-backend.onrender.com`).

---

## 4. Deploying the Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `CampusPulse` repository.
3. Set **Root Directory** to `frontend`.
4. Add the Environment Variable:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://campuspulse-backend.onrender.com/api/v1`
5. Click **Deploy**.

---

## 5. Post-Deployment Verification
- Open your live Vercel URL (e.g. `https://campuspulse.vercel.app`).
- Submit a sample issue (e.g. *"AC water leakage in AB1-305"*).
- Check the Admin Dashboard to verify real-time ingestion, status transitions, and analytics updates.
