# PulseRoute — Smart Emergency Hospital Finder & Healthcare Capacity Intelligence

> **"Find the right emergency care, when every minute matters."**

PulseRoute is a full-stack emergency response and hospital capacity platform designed as a polished healthcare startup operations interface. It ingests, audits, cleans, and analyzes a 10,035-record hospital dataset across 15 Indian metropolitan areas to match emergency patients with verified ICU beds, trauma teams, and specialized care facilities in real time.

---

## 🌟 Key Application Modes

PulseRoute operates in two distinct, decoupled modes via a top navigation mode switch:

### Mode A: Emergency Hospital Finder (Public / Dispatch View)
- **Clinical Emergency Triage**: Rapid selection across *Accident / Trauma*, *Cardiac Emergency*, *Neurological Emergency*, *Pediatric Emergency*, *General Critical Care*, and *Other Emergency*.
- **Haversine Geolocation Routing**: Browser Geolocation API integration with automatic fallback to City centroid, Locality, or Pincode search across customizable radius bounds (5 km, 10 km, 20 km, 50 km).
- **Required Clinical Facilities Matching**: Dynamic toggle chips for ICU, Trauma Center, Ambulance, 24x7 ER, Cardiology, Neurology, Orthopedics, Pediatrics, and Gynecology.
- **Dynamic Priority Optimization**: Configurable priority weights for Distance, Bed Availability, ICU Capacity, and ER Wait Time.
- **Transparent Suitability Score (0–100)**: Multi-criteria weighted heuristic providing an objective score breakdown and human-readable *"Why this hospital?"* rationale.
- **3-Column Professional Operations Layout**:
  - **Left**: Live filter sidebar for instant radius, star rating, and facility adjustments.
  - **Center**: High-density clinical hospital cards showing live vacancy, ICU status, ER wait time, and compare toggles.
  - **Right**: Synchronized interactive Leaflet map with custom status markers, hover pulse, and fit-to-bounds controls.
- **Slide-over Hospital Details Drawer**: Deep operational telemetry breakdown (inpatient bed occupancy %, ICU saturation %, specialized departments, and data quality indicators).
- **Side-by-Side Facility Comparison**: Compare up to 3 selected hospitals across all operational metrics.
- **Command-Style Quick Search**: Natural language bar supporting queries like *"Accident hospitals near me"* or *"Cardiac ICU in Delhi"*.

### Mode B: Hospital Data Processing Center (Admin / Data Engineering)
- **5-Stage Pipeline Tracker**:
  1. `Upload CSV` → 2. `Schema & Coordinate Validation` → 3. `Cleaning & Deduplication` → 4. `Feature Engineering` → 5. `Ready for Search Router`.
- **Drag & Drop CSV Upload**: Accepts any compatible hospital dataset (`.csv`), validates schema boundaries, and streams ingestion.
- **Automated Validation & Cleaning**:
  - Purges 35 exact duplicates from the raw 10,035 rows.
  - Standardizes inconsistent Yes/No categorical values (`'Available'`, `'yes'`, `'YES'`, `'No'`).
  - Imputes missing bed counts, ICU vacancies, ratings, and hospital names.
  - Handles out-of-bounds latitude/longitude coordinates via geographic bounding boxes and city centroid imputation.
- **Feature Engineering & Derived Fields**:
  - `Bed_Occupancy_Pct`, `ICU_Occupancy_Pct`, `Bed_Availability_Pct`
  - `Emergency_Capacity_Level`, `ICU_Capacity_Level`
  - `Facility_Count`, `Data_Quality_Score` (0–100% per record)
- **Interactive Processed Dataset Table**:
  - Paginated preview with column search, city filters, and tier filters.
  - Toggle to isolate flagged or imputed records.
  - Export cleaned data via **Download Processed CSV**.
- **Admin Capacity Analytics**:
  - Interactive Recharts visualizing hospital count per city, bed availability histograms, ICU capacity, and data quality score distribution.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Leaflet, Recharts, Framer Motion |
| **Backend** | Python 3.14+, FastAPI, Uvicorn, Pandas, NumPy, Pydantic v2, Scikit-learn, SQLAlchemy |
| **Database** | SQLite (Development) / PostgreSQL-ready architecture via SQLAlchemy |
| **Design Engine** | Stitch MCP Design System (`assets/17684098524788996497`) with clinical Inter typography |

---

## 📁 Repository Structure

```
dav_assignment/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point & lifespan
│   │   ├── config.py               # Application settings & environment config
│   │   ├── routes/                 # API routers: health, dataset, hospitals, analytics
│   │   ├── schemas/                # Pydantic data validation & response schemas
│   │   ├── services/               # Core services: hospital_service, scoring, analytics
│   │   ├── processing/             # Pipeline: validator, cleaner, feature_engineering
│   │   ├── database/               # SQLAlchemy engine, session, and ORM models
│   │   └── utils/                  # Geospatial math (Haversine) & city centroids
│   ├── data/
│   │   ├── raw/                    # smart_emergency_hospital_raw_10000.csv
│   │   └── processed/              # smart_emergency_hospital_processed.csv
│   ├── uploads/                    # Temporary staging for uploaded CSVs
│   ├── test_suite.py               # Comprehensive quality-bar automated tests
│   ├── requirements.txt            # Python dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, Hero, Stepper, ResultsView, HospitalCard,
│   │   │                           # HospitalMap, HospitalDrawer, HospitalCompareModal,
│   │   │                           # DataManagementView, CommandSearch
│   │   ├── services/api.ts         # REST API client
│   │   ├── types/index.ts          # Shared TypeScript models
│   │   ├── utils/cn.ts             # Tailwind class merging utility
│   │   ├── App.tsx                 # Root application controller
│   │   ├── main.tsx                # React DOM render root
│   │   └── index.css               # Tailwind v4 styles & Leaflet rules
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 🚀 Local Installation & Execution

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will automatically audit and process `backend/data/raw/smart_emergency_hospital_raw_10000.csv` on first startup.
- API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 🧪 Automated Testing & Verification

Run the comprehensive integration test suite verifying search, Haversine filtering, empty states, and upload sanitization:

```bash
python backend/test_suite.py
```

Expected output:
```
[PASS] GET /api/health passed
[PASS] GET /api/dataset/status passed (Records: 10000)
[PASS] GET /api/dataset/summary passed
[PASS] Search Delhi: 238 matches
[PASS] Pincode/Area search: 206 matches
[PASS] Geolocation coords search: 498 matches
[PASS] GET /api/hospitals/{id} passed
[PASS] GET /api/hospitals/{id}/explanation passed
[PASS] GET /api/dataset/preview pagination passed
[PASS] GET /api/dataset/preview flagged filter passed
[PASS] GET /api/analytics/charts passed (Cities count: 15)
[PASS] Smart empty state suggestion verified
[PASS] Invalid file upload rejection passed (Status 400)
==================================================
ALL QUALITY BAR AUTOMATED TESTS PASSED SUCCESSFULLY!
==================================================
```

---

## 🌐 API Reference

### Emergency Discovery & Routing
- `POST /api/hospitals/search`: Multi-criteria hospital search with Haversine distance, suitability score, and explanation.
- `GET /api/hospitals`: Paginated list of registered facilities.
- `GET /api/hospitals/{hospital_id}`: Detailed capacity and operational telemetry for a single hospital.
- `GET /api/hospitals/{hospital_id}/explanation`: Detailed mathematical breakdown for suitability recommendation.
- `GET /api/hospitals/nearby`: Fast geolocation radius search.

### Dataset Engineering & Admin
- `GET /api/dataset/status`: Current ingestion, validation, and cleaning pipeline report.
- `GET /api/dataset/summary`: High-level data volume and mean quality score.
- `POST /api/dataset/upload`: Upload a new hospital dataset CSV for automated validation and ingestion.
- `POST /api/dataset/process`: Re-trigger full audit and cleaning on the dataset.
- `GET /api/dataset/preview`: Paginated preview table with column filters, sorting, and flagged records isolation.
- `GET /api/dataset/download`: Export and download the cleaned CSV.

### Capacity Intelligence Analytics
- `GET /api/analytics/summary`: Aggregate metrics across total hospitals, bed occupancies, and trauma centers.
- `GET /api/analytics/charts`: Full distributions for city volume, bed histograms, ICU availability, and quality scores.

---

## ☁️ Production Deployment

### Frontend → Vercel
1. Set the root directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Set Environment Variable:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

### Backend → Render
1. Set the root directory to `backend`.
2. Environment: **Python 3**.
3. Build Command: `pip install -r requirements.txt`.
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set Environment Variables:
   ```
   ENVIRONMENT=production
   CORS_ORIGINS=https://your-frontend-app.vercel.app,http://localhost:5173
   DATABASE_URL=sqlite:///./pulseroute.db
   ```
   *(For PostgreSQL on Render, provide the connection string in `DATABASE_URL`)*.

---

## 🛡️ Medical Disclaimer
**PulseRoute is an academic demonstration and decision-support tool based on synthetic healthcare data.** It does not offer clinical medical advice or guaranteed real-time hospital reservations. In a medical emergency, immediately contact national emergency services at **112** or **108**.
