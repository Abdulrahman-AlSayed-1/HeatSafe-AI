# HeatSafe AI

> **Intelligent Thermal Exposure & Heat-Stress Mitigation Platform for Enterprise Industrial Operations**  
> *Built for the FortyGuard Hackathon '26 — Industrial & Enterprise Track*

---

## 🌟 Executive Overview

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

## 🚀 Key Platform Features

### 1. High-Resolution FortyGuard Microclimate Telemetry
- **Dynamic AOI Generation**: Automatically calculates $0.01^\circ \times 0.01^\circ$ geographic bounding polygons from worksite GPS coordinates.
- **Asynchronous Raster Polling**: Submits TCM heatmap jobs to the FortyGuard tOS API (`/v1/heatmap`), polls activity status with exponential backoff, and caches raster tiles.
- **Telemetry Sync Coordination**: Background synchronization service coordinates real-time surface thermal observations across active enterprise facilities.

### 2. ISO 7243 & OSHA Physiological Risk Composite Engine
- **Multi-Factor Hazard Modeling**: Combines ambient heat index, Wet Bulb Globe Temperature (WBGT), Discomfort Index (DI), and direct solar radiation.
- **Task Metabolic Risk Calculation**: Evaluates task physical intensity (Light, Moderate, Heavy, Very Heavy), environmental exposure category (Indoor, Low, Moderate, High), continuous duration, and crew headcount.
- **Diurnal Thermal Curve**: Models 24-hour diurnal heat curves with peak solar hazard windows ($12:00\text{--}17:00$) and off-peak recovery horizons.

### 3. Interactive What-If Scenario Simulator
- **4 Operational Mitigation Levers**:
  1. **Shift Time Window**: Shift start time sliders and fast diurnal presets (Early Morning, Morning, Late Afternoon, Night).
  2. **Continuous Exposure Duration**: Adjust duration from 30 to 360 minutes with instant strain re-evaluations.
  3. **Work-Rest Cycles**: Enforce OSHA / ISO 7243 work-rest rotations ($45\text{m}/15\text{m}$, $30\text{m}/30\text{m}$, $15\text{m}/45\text{m}$, or Stoppage).
  4. **Engineering Controls**: Pre-stage cooling stations, active misting fans, evaporative PPE, and hydration monitors.
- **Live Commit Pipeline**: 1-click application applies simulated mitigation parameters directly to active production schedules, recalculating worksite risk in real time.
- **Pre-Shift Staging Guard**: Automatically locks schedule commits for shifts scheduled $>12\text{h}$ in advance, staging parameters until verified FortyGuard satellite observations unlock at $T-12\text{h}$.

### 4. Enterprise Decision Cockpit & UI System
- **Thermal Horizon Radial Gauge**: Sleek 220° radial instrument panel with dynamic severity color mapping, status pills, and localized microclimate metrics.
- **4-Phase Segmented Diurnal Tracker**: Replaces cluttered timeline bars with discrete, intuitive diurnal shift blocks (`Dawn 00-06h`, `Morning 06-12h`, `Midday Peak 12-17h`, `Evening 17-24h`).
- **Dual-Level AI Recommendations**: Site-wide OSHA operational advisories alongside task-tailored mitigations featuring 1-click **Simulate in What-If** routing.
- **Executive Plan Export**: Client-side high-resolution PDF generation with branded headers, facility metrics, and task rosters.
- **Full Mobile Responsiveness**: Seamless experience across mobile, tablet, and widescreen industrial displays.

---

## 🏗️ System Architecture & Technology Stack

```
HeatSafe-AI/
├── backend/                              # Spring Boot 3.2.0 (Java 17) Modular Monolith
│   ├── src/main/java/com/heatsafe/
│   │   ├── adapter/fortyguard/           # Real FortyGuard client, AOI service, DTOs & exceptions
│   │   ├── api/                          # REST Controllers, DTOs, Mappers, Global Exception Handler
│   │   ├── config/                       # RestTemplate, Dotenv & Application configuration
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
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml                    # Multi-container orchestration (Backend + Postgres)
├── Dockerfile                            # Production backend container build
└── README.md
```

### Technology Highlights:
- **Backend**: Java 17, Spring Boot 3.2.0, Spring Data JPA, Hibernate, Flyway Migration, RestTemplate.
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide React, Recharts, `html2canvas`, `jspdf`.
- **Database**: PostgreSQL 15 with spatial coordinates support.
- **External Satellite Provider**: FortyGuard tOS Enterprise REST API (`analytic_type=tcm`).

---

## 📋 Complete REST API Reference

### 1. Worksites
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/worksites` | List all registered enterprise worksites |
| `POST` | `/api/worksites` | Register a new worksite with geographic coordinates |
| `GET` | `/api/worksites/{id}` | Retrieve worksite details and current risk profile |
| `PUT` | `/api/worksites/{id}` | Update worksite parameters |
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

## ⚡ Quick Start Guide

### Prerequisites
- **Java 17+** & **Maven 3.9+**
- **Node.js 18+** & **npm 9+**
- **PostgreSQL 15+** (or Docker)
- **FortyGuard API Key**

---

### Option A: Running with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abdulrahman-AlSayed-1/HeatSafe-AI.git
   cd HeatSafe-AI
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Add your FORTYGUARD_API_KEY in .env
   ```

3. **Launch all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - **Frontend UI**: `http://localhost:5173` (or `http://localhost:3000`)
   - **Backend REST API**: `http://localhost:8080`
   - **Actuator Health**: `http://localhost:8080/actuator/health`

---

### Option B: Local Development Setup

#### 1. Start PostgreSQL
```bash
docker run --name heatsafe-postgres \
  -e POSTGRES_DB=heatsafe \
  -e POSTGRES_USER=heatsafe \
  -e POSTGRES_PASSWORD=heatsafe \
  -p 5432:5432 -d postgres:15-alpine
```

#### 2. Start the Backend (Spring Boot)
```bash
cd backend
mvn clean package -DskipTests
java -jar target/heatsafe-ai-1.0.0.jar
```
*The backend runs on `http://localhost:8080` and automatically runs Flyway migrations `V1` through `V4`.*

#### 3. Start the Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
*The frontend development server launches on `http://localhost:5173`.*

---

## ⚙️ Environment Configuration

| Variable | Description | Default / Example | Required |
|---|---|---|:---:|
| `FORTYGUARD_API_KEY` | FortyGuard tOS Enterprise API Key | `fg_live_...` | **Yes** |
| `FORTYGUARD_BASE_URL` | FortyGuard API Base URL | `https://api.fortyguard.com` | No |
| `DATABASE_URL` | PostgreSQL JDBC Connection String | `jdbc:postgresql://localhost:5432/heatsafe` | No |
| `DATABASE_USERNAME` | PostgreSQL User | `heatsafe` | No |
| `DATABASE_PASSWORD` | PostgreSQL Password | `heatsafe` | No |
| `SERVER_PORT` | Spring Boot Server Port | `8080` | No |
| `SPRING_PROFILES_ACTIVE` | Active Spring Profile | `dev` | No |

---

## 🧪 Testing & Validation

```bash
# Run backend test suite (unit + integration tests)
cd backend
mvn test

# Validate frontend production build
cd frontend
npm run build
```

---

## 📄 License

Developed for the **FortyGuard Hackathon '26** under the **Industrial & Enterprise Track**. All rights reserved.