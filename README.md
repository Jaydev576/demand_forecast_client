Local dev: connect frontend to backend

This project uses Vite for the frontend and a separate backend in `Demand_Forecast_Backend`.

How to point the frontend to your backend:

1. Edit the frontend `.env` at the project root (already created) and set:

VITE_API_URL=http://127.0.0.1:8000

2. Start the backend (FastAPI/Flask) from the `Demand_Forecast_Backend` folder. For example (powershell):

# from repo root
cd ..\Demand_Forecast_Backend; python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt; uvicorn main:app --reload --host 127.0.0.1 --port 8000

Adjust commands to match your backend's entrypoint (e.g. `main.py` or `app.py`).

3. Start the frontend (from `project` folder):

# powershell
npm install
npm run dev

The frontend will use `import.meta.env.VITE_API_URL` (set in `.env`) as the base URL. A small helper is in `src/lib/api.ts` which attaches Supabase auth token when available.

Endpoints used by the UI (expected on backend):
- POST /forecast  -> { dataset_id, forecast_days, filters }  (returns 202 for processing or 200 with results)

If your backend endpoints differ, update `src/lib/api.ts` or change calls in `src/pages/Forecast.tsx`.
