# HeatSafe AI

> **Intelligent Thermal Exposure & Heat-Stress Mitigation Platform for Enterprise Industrial Operations**  
> *Built for the FortyGuard Hackathon '26 — Industrial & Enterprise Track*

---

## Executive Overview

**HeatSafe AI** is an operational heat-risk decision-support and mitigation system designed for industrial facilities, open-air construction sites, logistics hubs, and infrastructure projects. By integrating **FortyGuard high-resolution satellite microclimate telemetry (TCM)** with **ISO 7243 physiological heat strain standards** and **OSHA occupational safety protocols**, HeatSafe AI transforms raw thermal rasters into actionable, task-tailored workforce protection schedules.

```
       [ FortyGuard tOS API ]                   [ Industrial Worksite ]
      (Satellite TCM Telemetry)                 (Tasks, Crew, Schedules)
                 │                                         │
                 ▼                                         ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                  HeatSafe AI Thermal Engine                  │
   │  • AOI Polygon Generation     • ISO 7243 Strain Composite   │
   │  • Microclimate Tile Caching  • Task Metabolic Risk Scoring  │
   └──────────────────────────────┬───────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│     Live Decision Dashboard      │    │     What-If Scenario Engine      │
│ • Thermal Horizon Radial Gauge   │    │ • 4-Lever Mitigation Simulator   │
│ • 4-Phase Diurnal Shift Tracker  │    │ • Live Schedule Commit Pipeline  │
│ • Interactive Thermal Heatmaps   │    │ • Pre-Shift (>12h) Horizon Guard │
│ • Dual-Level AI Recommendations  │    │ • Executive PDF Plan Export      │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

---

## Key Platform Features

### 1. High-Resolution FortyGuard Microclimate Telemetry
- **Dynamic AOI Generation**: Automatically calculates 0.01° × 0.01° geographic bounding polygons from worksite GPS coordinates.
- **Asynchronous Raster Polling**: Submits TCM heatmap jobs to the FortyGuard tOS API (`/v1/heatmap`), polls activity status with exponential backoff, and caches raster tiles.
- **Telemetry Sync Coordination**: Background synchronization service coordinates real-time surface thermal observations across active enterprise facilities.

### 2. ISO 7243 & OSHA Physiological Risk Composite Engine
- **Multi-Factor Hazard Modeling**: Combines ambient heat index, Wet Bulb Globe Temperature (WBGT), Discomfort Index (DI), and direct solar radiation.
- **Task Metabolic Risk Calculation**: Evaluates task physical intensity (Light, Moderate, Heavy, Very Heavy), environmental exposure category (Indoor, Low, Moderate, High), continuous duration, and crew headcount.
- **Diurnal Thermal Curve**: Models 24-hour diurnal heat curves with peak solar hazard windows (12:00–17:00) and off-peak recovery horizons.

### 3. Interactive What-If Scenario Simulator
- **4 Operational Mitigation Levers**:
  1. **Shift Time Window**: Shift start time sliders and fast diurnal presets (Early Morning, Morning, Late Afternoon, Night).
  2. **Continuous Exposure Duration**: Adjust duration from 30 to 360 minutes with instant strain re-evaluations.
  3. **Work-Rest Cycles**: Enforce OSHA / ISO 7243 work-rest rotations (45m/15m, 30m/30m, 15m/45m, or Stoppage).
  4. **Engineering Controls**: Pre-stage cooling stations, active misting fans, evaporative PPE, and hydration monitors.
- **Live Commit Pipeline**: 1-click application applies simulated mitigation parameters directly to active production schedules, recalculating worksite risk in real time.
- **Pre-Shift Staging Guard**: Automatically locks schedule commits for shifts scheduled >12h in advance, staging parameters until verified FortyGuard satellite observations unlock at T-12h.

### 4. Dual-Engine AI Mitigation System
- **Google Gemini & OpenAI Compatible**: Seamlessly integrates with Google Gemini (`gemini-2.0-flash`), OpenAI (`gpt-4o-mini`), Groq (`llama-3.3-70b`), or local Ollama for natural-language, OSHA/NIOSH-compliant safety advisories.
- **Deterministic Physiological Fallback**: Built-in rule-based expert system automatically calculates task-specific schedule shifts, 30m/30m work-rest cycles, and hydration mandates even if remote LLMs are offline or unconfigured.

### 5. Enterprise Decision Cockpit & UI System
- **Thermal Horizon Radial Gauge**: Sleek 220° radial instrument panel with dynamic severity color mapping, status pills, and localized microclimate metrics.
- **Distinct Risk Dimensions**: Cleanly separates physical environmental heat (FortyGuard satellite peak temperature) from workforce operational risk (shift exposure and metabolic strain).
- **4-Phase Segmented Diurnal Tracker**: Intuitive diurnal shift blocks (Dawn 00-06h, Morning 06-12h, Midday Peak 12-17h, Evening 17-24h).
- **Executive Plan Export**: Client-side high-resolution PDF generation with branded headers, facility metrics, and task rosters.
- **Full Mobile Responsiveness**: Seamless experience across mobile, tablet, and widescreen industrial displays.

---

## Production Cloud Deployment Architecture

HeatSafe AI is deployed in a modern, decoupled serverless & containerized multi-cloud architecture:

```
┌───────────────────────────────┐      ┌───────────────────────────────┐
│     Vercel Edge Platform      │      │     SnapDeploy Container      │
│  React 18 + TypeScript + Vite │ ───► │  Spring Boot 3.2 (Java 17)    │
│  (SPA Global CDN Distribution)│      │  (Microclimate & Risk Engine) │
└───────────────────────────────┘      └──────────────┬────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
        ┌─────────────────────────────┐                               ┌─────────────────────────────┐
        │    Neon Lakebase Postgres   │                               │     FortyGuard tOS API      │
        │ Serverless Postgres (AWS)   │                               │ High-Res Satellite Rasters  │
        │ Instant Pooling & Scale-to-0│                               │ Dynamic AOI Microclimates   │
        └─────────────────────────────┘                               └─────────────────────────────┘
```

* **Frontend**: Hosted on **Vercel** with client-side routing, automated CI/CD builds, and responsive glassmorphism UI.
* **Backend**: Docker container built from Eclipse Temurin 17 JRE deployed on **SnapDeploy** / cloud container runner.
* **Database**: Hosted on **Neon Lakebase Postgres** (`aws-us-east-2`) featuring Flyway automated schema migrations `V1`–`V4`.
* **AI Provider**: Google AI Studio **Gemini 2.0 Flash** / OpenAI-compatible endpoint.
* **Satellite Telemetry**: Live **FortyGuard tOS Enterprise API** with TCM thermal rasters.

---

## System Architecture & Technology Stack

```
HeatSafe-AI/
├── backend/                              # Spring Boot 3.2.0 (Java 17) Modular Monolith
│   ├── src/main/java/com/heatsafe/
│   │   ├── adapter/fortyguard/           # Real FortyGuard client, AOI service, DTOs & exceptions
│   │   ├── api/                          # REST Controllers, DTOs, Mappers, Global Exception Handler
│   │   ├── config/                       # WebCorsConfig, RestTemplate & Application configuration
│   │   ├── domain/                       # Worksite, Task, HeatRiskAssessment JPA Entities
│   │   └── service/                      # Risk Engine, Scenario Simulator, Recommendation Services
│   ├── src/main/resources/
│   │   ├── application.yml               # Base application configuration
│   │   ├── application-dev.yml           # Development profile
│   │   └── db/migration/                 # Flyway migrations (V1 to V4)
│   └── pom.xml                           # Maven dependencies
├── frontend/                             # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                          # Typed Axios API clients (Heatmap, Tasks, Worksites, Scenarios)
│   │   ├── components/                   # ThermalHorizonGauge, TaskList, HeatmapViewer, BrandLogo
│   │   ├── pages/                        # Dashboard, ScenarioEditor, WorksiteSelection, Add/EditTask
│   │   └── utils/                        # Geographic validation & formatting helpers
│   ├── vercel.json                       # Vercel SPA rewrite routing rules
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile                            # Production backend container build
├── neon.ts                               # Neon Lakebase Postgres Infrastructure-as-Code
└── README.md
```

---

## Complete REST API Reference

### 1. Worksites
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/worksites` | List all registered enterprise worksites |
| `POST` | `/api/worksites` | Register a new worksite with geographic coordinates |
| `GET` | `/api/worksites/{id}` | Retrieve worksite details and current risk profile |
| `DELETE` | `/api/worksites/{id}` | Remove a worksite and cascade delete tasks |

### 2. Task Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/worksites/{id}/tasks` | Retrieve all scheduled tasks for a worksite |
| `POST` | `/api/worksites/{id}/tasks` | Create a task (name, schedule, duration, exposure, crew count) |
| `GET` | `/api/tasks/{taskId}` | Retrieve task details |
| `PUT` | `/api/tasks/{taskId}` | Update task schedule and parameters |
| `DELETE` | `/api/tasks/{taskId}` | Delete a task |

### 3. FortyGuard Telemetry & Thermal Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/worksites/{id}/heatmap` | Fetch FortyGuard satellite microclimate raster heatmap |
| `GET` | `/api/worksites/{id}/thermal-profile`| Fetch surface temperature profile, diurnal range, & metrics |
| `GET` | `/api/worksites/{id}/heat-exposure` | Retrieve aggregated thermal exposure indices |
| `POST` | `/api/telemetry-sync/{id}` | Trigger immediate FortyGuard satellite telemetry resynchronization |

### 4. Risk Assessment & Recommendations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/worksites/{id}/heat-risk` | Calculate live ISO 7243 heat risk assessment & critical windows |
| `GET` | `/api/worksites/{id}/recommendations` | Generate site-wide and task-tailored AI mitigation advisories |

### 5. What-If Scenario Simulator
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/worksites/{id}/scenario` | Evaluate simulated mitigations or commit changes to live schedule |

---

## Quick Start Guide

### Prerequisites
- **Java 17+** & **Maven 3.9+**
- **Node.js 18+** & **npm 9+**
- **Neon PostgreSQL** or local PostgreSQL 15+
- **FortyGuard API Key**

---

### Option A: Local Development Setup

#### 1. Configure Environment Variables
In `backend/.env`:
```properties
DATABASE_URL=jdbc:postgresql://<neon-host>:5432/neondb?sslmode=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=<your-password>
FORTYGUARD_API_KEY=<your-fortyguard-key>
AI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
OPENAI_API_KEY=<your-gemini-key>
AI_MODEL=gemini-2.0-flash
```

#### 2. Start the Backend (Spring Boot)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/heatsafe-ai-1.0.0.jar
```
*The backend boots on `http://localhost:8080` and applies Flyway migrations `V1`–`V4` automatically.*

#### 3. Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*The frontend development server launches on `http://localhost:5173`.*

---

## Environment Configuration Variables

| Variable | Description | Example / Default | Required |
|---|---|---|:---:|
| `DATABASE_URL` | Neon Postgres JDBC Connection String | `jdbc:postgresql://ep-....aws.neon.tech:5432/neondb?sslmode=require` | Yes |
| `DATABASE_USERNAME` | Neon Postgres User | `neondb_owner` | Yes |
| `DATABASE_PASSWORD` | Neon Postgres Password | `npg_...` | Yes |
| `FORTYGUARD_API_KEY` | FortyGuard tOS Enterprise API Key | `fea25af1...` | Yes |
| `FORTYGUARD_BASE_URL` | FortyGuard API Base URL | `https://api.fortyguard.com` | No |
| `AI_ENDPOINT` | LLM Chat Completions URL | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | No |
| `OPENAI_API_KEY` | Google Gemini or OpenAI API Key | `AIzaSy...` | No |
| `AI_MODEL` | AI Model Identifier | `gemini-2.0-flash` / `llama3.1` | No |
| `SERVER_PORT` | Spring Boot Server Port | `8080` | No |
| `VITE_API_BASE_URL` | Backend URL for Frontend | `https://heatsafe-ai-a730d.containers.snapdeploy.app` | Yes (in Prod) |

---

## Testing & Validation

```bash
# Run backend test suite (unit + integration tests)
cd backend
mvn test

# Validate frontend production build
cd frontend
npm run build
```

---

## License

Developed for the **FortyGuard Hackathon '26** under the **Industrial & Enterprise Track**. All rights reserved.