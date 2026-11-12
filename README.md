# URJA — India Green Grid

Full-stack local build of URJA: the existing React 19 / TypeScript / Vite frontend
plus a modular Python FastAPI backend that serves the energy, RPO, solar,
weather, map, services and assistant features.

```
code-Spark101/
├── backend/            FastAPI app, policy data, tests, .env.example
├── frontend/
│   ├── package.json    workspace root
│   ├── src/frontend/   the existing React app (design unchanged)
│   └── src/backend/    the existing Caffeine / Internet Computer scaffold (untouched)
├── docs/               legacy project readme kept for history
└── README.md
```

The frontend design, routes, Tailwind tokens, Recharts visualisations and the
Caffeine/Internet Computer authentication scaffold were preserved. The new
backend is additive and the frontend talks to it through one API client.

---

## 1. What runs where

| Layer | URL / location |
| --- | --- |
| React frontend (Vite dev server) | http://localhost:5173 |
| FastAPI backend | http://127.0.0.1:8000 |
| Swagger / OpenAPI docs | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| SQLite database | `backend/urja.db` |

---

## 2. Windows CMD setup

### Terminal 1 — backend

```cmd
cd /d "C:\Users\Sachin.K\Hackthon\code-Spark101"

cd backend

py -3.12 -m venv .venv

.venv\Scripts\activate

python -m pip install --upgrade pip

pip install -r requirements.txt

copy .env.example .env

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Python **3.12** is required on this machine: Python 3.14 is blocked by the
Windows Application Control policy for the compiled `pydantic-core` /
SQLAlchemy extensions. Any Python 3.11–3.13 works.

### Terminal 2 — frontend

```cmd
cd /d "C:\Users\Sachin.K\Hackthon\code-Spark101"

cd frontend

pnpm install

pnpm --dir src/frontend dev
```

`pnpm` is not installed globally here, so `npx --yes pnpm@10.26.1 install` (and
the same prefix for `dev`/`build`/`test`) works as an alternative.

If the API base URL differs from the default, create
`frontend/src/frontend/.env` with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Everyday commands

```cmd
:: activate / deactivate the virtual environment
backend\.venv\Scripts\activate
deactivate

:: add a Python dependency
pip install <package>
pip freeze > requirements.txt

:: backend tests
cd backend
.venv\Scripts\python.exe -m pytest -q

:: frontend checks
cd frontend\src\frontend
npx --yes pnpm@10.26.1 typecheck
npx --yes pnpm@10.26.1 test --run
npx --yes pnpm@10.26.1 build

:: stop a server started in a terminal
Ctrl + C
```

Troubleshooting:

| Symptom | Fix |
| --- | --- |
| `ImportError: DLL load failed ... Application Control policy` | You are on Python 3.14; recreate `.venv` with `py -3.12`. |
| Frontend shows "Cannot reach the URJA backend" | Start uvicorn in Terminal 1; check port 8000 is free. |
| `[Errno 10048] address already in use` | Stop the other uvicorn (`netstat -ano \| findstr :8000`, then `taskkill /PID <pid> /F`). |
| CORS error in the browser | Add your dev origin to `FRONTEND_ORIGINS` in `backend/.env` and restart. |
| Ask/Weather/Voice say "not configured" | Provider keys are missing — see section 4. |

---

## 3. Environment variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
DATABASE_URL=sqlite:///./urja.db
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
GOOGLE_APPLICATION_CREDENTIALS=
OPENWEATHER_API_KEY=
LOG_LEVEL=INFO
```

Nothing is required to boot the API. The four provider keys enable Ask URJA,
Weather and Google voice; without them those features return a clear `503` with
a configuration message and the UI shows it instead of inventing data.

---

## 4. Provider credentials

### 4.1 Google Programmable Search (Ask URJA)

1. https://console.cloud.google.com → create/select a project.
2. Enable **Custom Search API**.
3. Credentials → **Create credentials → API key**. Restrict it to the Custom
   Search API.
4. https://programmablesearchengine.google.com → **Add** a search engine, set
   "Search the entire web", copy the **Search engine ID** (cx).
5. Put both values in `backend/.env`:
   `GOOGLE_SEARCH_API_KEY=...`, `GOOGLE_SEARCH_ENGINE_ID=...`, restart uvicorn.

Free tier is 100 queries/day. Answers are composed from retrieved snippets and
always list their sources; official domains (MNRE, CEA, BEE, NITI Aayog,
Ministry of Power, GRID-INDIA, state portals) are ranked first. There is no LLM
in this path, so no sentence in an answer is generated.

### 4.2 OpenWeatherMap (Weather)

1. https://home.openweathermap.org/users/sign_up → **API keys**.
2. Set `OPENWEATHER_API_KEY=...` in `backend/.env`, restart.
3. Free plan covers current weather + 5 day / 3 hour forecast (the endpoints
   this app uses). If your plan lacks an endpoint the API returns
   `weather_upstream_error` with the provider status.

The key never reaches the browser; only the backend calls OpenWeatherMap.

### 4.3 Google Cloud Speech (Voice)

1. Cloud Console → enable **Speech-to-Text API** and **Text-to-Speech API**.
2. IAM → Service accounts → create one with those roles → **Keys → Add key →
   JSON**, download it outside the repo (or into `backend/`, which is ignored).
3. `GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json`
4. `pip install -r requirements-voice.txt` (optional SDKs, kept out of the base
   install), restart.

Until this is set, `GET /api/v1/voice/status` reports `"configured": false` and
the Voice page uses the browser Web Speech API, labelled "Browser speech
fallback" on screen.

---

## 5. API surface (`/api/v1`)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | liveness, DB check, feature flags |
| POST | `/ask` | retrieve + compose a sourced answer |
| GET | `/ask/history` | this session's turns |
| GET | `/energy/mix` | installed capacity and generation by source |
| GET | `/energy/capacity` | capacity-only view |
| GET | `/energy/generation` | generation-only view |
| GET | `/energy/states` | state comparison |
| POST | `/energy/calculate` | renewable share / RE requirement |
| POST | `/environment/carbon-calculate` | CO₂ avoidance |
| GET | `/environment` | environmental indicators |
| POST | `/rpo/calculate` | RPO compliance |
| GET | `/rpo/targets` | versioned policy targets + source |
| POST | `/solar/calculate` | rooftop solar sizing, subsidy, ROI |
| GET | `/weather/current` | current conditions |
| GET | `/weather/forecast` | 5 day / 3 hour forecast |
| POST | `/forecasting/estimate` | solar/wind yield estimate |
| POST | `/forecasting/battery` | battery sizing estimate |
| GET | `/maps/categories`, `/maps/locations` | map data |
| GET | `/services`, `/services/{id}` | public services directory |
| GET | `/jobs`, `/finance`, `/circularity` | module datasets |
| POST | `/voice/transcribe`, `/voice/speak` | Google voice (server-side) |
| GET | `/voice/status` | provider + supported actions |
| GET | `/data-sources` | datasets, providers, provenance |

All request bodies are Pydantic-validated. Errors use one shape:
`{"detail": {"code", "message", "details"}}` with codes such as
`validation_error`, `search_not_configured`, `weather_not_configured`,
`voice_not_configured`, `rpo_target_unavailable`, `rate_limited`.

---

## 6. RPO methodology

Targets live in `backend/app/data/rpo_targets.json` as **versioned policy data**
(version `mop-rpo-2023-10-20`) transcribed from the Ministry of Power
notification of 20 October 2023, with the source URL and effective dates.

```
required  = consumption × target%
eligible  = renewable procured + eligible certificates (capped at required)
compliance = eligible / required × 100
shortfall = max(0, required − eligible)
surplus   = max(0, eligible − required)
```

* Supported years: FY 2024-25 … 2029-30; supported categories: DISCOM (with
  wind / hydro / distributed / other sub-targets), captive and open-access
  consumers (single total obligation).
* Certificates are capped at the remaining requirement so nothing is counted
  twice, and rejected volume is reported.
* A year/category without a notified target raises `rpo_target_unavailable`
  rather than guessing a percentage.
* To add a future year, append to the JSON and bump `version`/`effective_from` —
  no code change is needed.

## 7. Solar ROI methodology

Assumptions in `backend/app/data/solar_assumptions.json` (cost/kW, specific
yield per state, performance ratio, degradation, tariff escalation, O&M,
lifetime 25 years, CO₂ factor 0.71 kg/kWh, PM Surya Ghar subsidy slabs with
source URL and last-verified date). Capacity is sized to the lower of
consumption-driven capacity and roof-area capacity, then generation, savings,
payback, lifetime savings and avoided CO₂ follow from those inputs. Every
response carries `assumptions`, `subsidy_source` and a `disclaimer`; nothing is
presented as a quotation or a guaranteed subsidy.

---

## 8. Frontend pages connected

| Page | State |
| --- | --- |
| Home / Ask (`/`) | asks the backend, shows loading, sources, reset; 503 message when Google search is not configured |
| Weather (`/weather`, new) | current + forecast, search, refresh, last-updated, configuration banner |
| Energy Calculations (`/energy-calculations`, new) | five backend-driven calculators |
| RPO Compliance | live `/rpo/calculate`, notified sub-targets shown read-only |
| Solar ROI | live `/solar/calculate`, real CSV export |
| Explore Map | Leaflet + OpenStreetMap, category filters, marker/list sync, attribution |
| Public Services | backend directory, Transport/RTO/Passport removed |
| Voice | MediaRecorder → `/voice/transcribe` → `/ask` → `/voice/speak`, browser fallback, never claims Google is active when it is not |
| API Explorer | real requests to the running backend; example payloads labelled as examples |

Green Jobs, Green Finance, Circular Economy, Environmental Impact, Energy Mix,
Forecasting, Stakeholder Portal and Data Sources still render their original
labelled reference content, while their backend endpoints are implemented and
documented — see "Known limitations".

## 9. Security

* All provider keys stay in `backend/.env`; no secret is read by Vite and no
  `VITE_` variable holds a key.
* `.gitignore` excludes `.env*`, venvs, databases, logs and service-account
  JSON.
* CORS is restricted to the configured origins; request bodies are size-limited;
  externally backed endpoints are rate-limited; exceptions return a stable error
  contract without stack traces.
* Ask history is scoped by an anonymous per-tab session id; voice audio is
  processed in memory and never written to disk.
* SQLAlchemy models keep the schema portable to PostgreSQL via `DATABASE_URL`.

## 10. Tests actually run

```text
backend  : .venv\Scripts\python.exe -m pytest -q   → 56 passed
frontend : pnpm test --run                          → 73 passed (12 files)
typecheck: tsc --noEmit                             → clean
build    : vite build                               → succeeded
```

Smoke checks against the running servers: `/api/v1/health`, `/rpo/targets`,
`/services`, `/maps/categories`, `/energy/mix`, `/data-sources`, `/jobs`,
`/finance`, `/circularity`, `/environment`, `/voice/status` all `200`;
`/rpo/calculate` and `/solar/calculate` returned computed results;
`/weather/current` returned `503 weather_not_configured`; `/ask` returned
`503 search_not_configured` (no keys configured yet).

## 11. Known limitations

1. Ask URJA, Weather and Google voice need the credentials in section 4; until
   then they return configuration errors by design.
2. Green Jobs, Green Finance, Circular Economy, Environmental Impact, Energy Mix,
   Forecasting, Stakeholder Portal and Data Sources pages still display their
   original sample/reference content; the backend endpoints they would consume
   are live. Wiring those pages is the next step.
3. RPO targets are the 2023 notification only; later amendments must be added to
   `rpo_targets.json`.
4. Forecasting is a transparent yield model, not a trained ML model.
5. Local deployment only: SQLite, no cloud hosting, Caffeine/IC auth untouched.

Legacy project notes are archived in `docs/README-publicconnect.md`.
