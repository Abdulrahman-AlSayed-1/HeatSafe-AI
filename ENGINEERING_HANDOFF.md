# HeatSafe AI - Engineering Handoff Document

**Date**: August 23, 2026  
**Hackathon**: FortyGuard Hackathon '26  
**Track**: Industrial & Enterprise  
**Timeline**: 7 Days

---

## A. WHAT YOU UNDERSTOOD

### Problem Statement

HeatSafe AI solves the problem of **operational heat-risk management** for industrial worksites. The core issue is that worksite managers need to:

1. **Understand temporal heat patterns** - Not just current temperature, but how heat varies throughout the day
2. **Map heat risk to scheduled work** - Identify which tasks overlap with dangerous heat periods
3. **Make data-driven scheduling decisions** - Test alternative schedules (What-if scenarios) to reduce worker heat exposure
4. **Get actionable recommendations** - AI-powered guidance on risk mitigation

The product combines FortyGuard's environmental intelligence with operational context (worksites, tasks, schedules) to transform raw temperature data into operational decisions.

### MVP Scope

The MVP is a **decision-support dashboard** with:

- **Interactive temperature timeline** - Visual chart showing hourly temperature with risk overlays
- **Critical window identification** - Automatically detected dangerous heat periods
- **Task intersection mapping** - Show which scheduled tasks overlap with critical windows
- **AI recommendations** - Explain the situation and suggest actions
- **What-if scenarios** - Test alternative task schedules and compare risk assessments

**What the MVP is NOT** (per document):
- Not a chatbot with temperature API attached
- Not a forecast prediction system (unless FortyGuard provides confirmed forecast data)
- Not a medical diagnosis tool
- Not a complex multi-agent system

### Architecture

**Pattern**: Modular Monolith (Spring Boot)

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│              (Dashboard + Interactive Chart)                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/JSON
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot API (Modular Monolith)             │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   worksite   │    task      │ temperature  │     risk      │
│   module     │   module     │   module     │   module      │
└──────────────┴──────────────┴──────────────┴───────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ FortyGuard   │ │ Risk Engine  │ │ AI Module    │
│ Adapter      │ │(Deterministic│ │(Spring AI)   │
│              │ │  Rules)      │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              FortyGuard tOS Enterprise API                  │
│         (Async submit → poll → result pattern)              │
└─────────────────────────────────────────────────────────────┘
```

### Main Data Flow

1. **User selects worksite** → Frontend calls `/api/worksites/{id}`
2. **Temperature data** → FortyGuard adapter fetches data (async job pattern)
3. **Risk calculation** → Deterministic engine computes risk level, critical windows
4. **Task intersection** → Engine identifies which tasks overlap critical windows
5. **AI explanation** → Spring AI generates recommendations based on calculated data
6. **What-if scenario** → User changes task time → System recalculates → Comparison shown

---

## B. WHAT YOU CHANGED

### Files Created

**Backend Foundation:**
- `pom.xml` - Maven configuration with Spring Boot 3.2, PostgreSQL, Flyway, Spring AI
- `src/main/java/com/heatsafe/HeatSafeApplication.java` - Main Spring Boot application
- `src/main/resources/application.yml` - Main configuration
- `src/main/resources/application-dev.yml` - Development profile
- `.env.example` - Environment variable template
- `.gitignore` - Git ignore patterns

**Domain Models:**
- `src/main/java/com/heatsafe/domain/worksite/Worksite.java` - Worksite entity with JPA
- `src/main/java/com/heatsafe/domain/worksite/WorksiteRepository.java` - Worksite repository
- `src/main/java/com/heatsafe/domain/task/Task.java` - Task entity with exposure types
- `src/main/java/com/heatsafe/domain/task/TaskRepository.java` - Task repository
- `src/main/java/com/heatsafe/domain/temperature/TemperatureObservation.java` - Temperature data point
- `src/main/java/com/heatsafe/domain/temperature/TemperatureSeries.java` - Temperature series with critical windows
- `src/main/java/com/heatsafe/domain/risk/HeatRiskAssessment.java` - Risk assessment with affected tasks
- `src/main/java/com/heatsafe/domain/scenario/Scenario.java` - What-if scenario model

**API Layer:**
- `src/main/java/com/heatsafe/api/dto/WorksiteDTO.java` - Worksite DTO
- `src/main/java/com/heatsafe/api/dto/TaskDTO.java` - Task DTO
- `src/main/java/com/heatsafe/api/dto/TemperatureSeriesDTO.java` - Temperature series DTO with conversion methods
- `src/main/java/com/heatsafe/api/dto/HeatRiskAssessmentDTO.java` - Risk assessment DTO
- `src/main/java/com/heatsafe/api/dto/ScenarioRequestDTO.java` - Scenario request DTO
- `src/main/java/com/heatsafe/api/dto/ScenarioResponseDTO.java` - Scenario response DTO
- `src/main/java/com/heatsafe/api/dto/JobStatusDTO.java` - Job status DTO for async operations

**Controllers:**
- `src/main/java/com/heatsafe/api/controller/WorksiteController.java` - Worksite CRUD endpoints
- `src/main/java/com/heatsafe/api/controller/TaskController.java` - Task management endpoints
- `src/main/java/com/heatsafe/api/controller/TemperatureController.java` - Temperature series endpoint
- `src/main/java/com/heatsafe/api/controller/HeatRiskController.java` - Risk assessment endpoint
- `src/main/java/com/heatsafe/api/controller/ScenarioController.java` - What-if scenario endpoint
- `src/main/java/com/heatsafe/api/controller/JobController.java` - Job status endpoint

**Service Interfaces:**
- `src/main/java/com/heatsafe/service/WorksiteService.java` - Worksite service interface
- `src/main/java/com/heatsafe/service/TaskService.java` - Task service interface
- `src/main/java/com/heatsafe/service/TemperatureService.java` - Temperature service interface
- `src/main/java/com/heatsafe/service/HeatRiskService.java` - Risk assessment service interface
- `src/main/java/com/heatsafe/service/ScenarioService.java` - Scenario evaluation service interface
- `src/main/java/com/heatsafe/service/JobService.java` - Job tracking service interface

**FortyGuard Adapter:**
- `src/main/java/com/heatsafe/adapter/fortyguard/FortyGuardClient.java` - Async job client interface
- `src/main/java/com/heatsafe/adapter/fortyguard/TemperatureDataProvider.java` - Temperature data provider interface
- `src/main/java/com/heatsafe/adapter/fortyguard/Location.java` - Location model
- `src/main/java/com/heatsafe/adapter/fortyguard/TimeWindow.java` - Time window model
- `src/main/java/com/heatsafe/adapter/fortyguard/dto/AnalysisRequest.java` - Analysis request DTO
- `src/main/java/com/heatsafe/adapter/fortyguard/dto/AnalysisStatus.java` - Analysis status DTO
- `src/main/java/com/heatsafe/adapter/fortyguard/dto/AnalysisResult.java` - Analysis result DTO

**Database:**
- `src/main/resources/db/migration/V1__Create_initial_schema.sql` - Initial schema for worksites and tasks

**Infrastructure:**
- `docker-compose.yml` - Docker orchestration for PostgreSQL and backend
- `Dockerfile` - Backend container definition

**Frontend Foundation:**
- `frontend/package.json` - React dependencies (React 18, TypeScript, Vite, TailwindCSS, Recharts, Lucide icons)
- `frontend/vite.config.ts` - Vite configuration with API proxy
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tsconfig.node.json` - TypeScript config for Node
- `frontend/tailwind.config.js` - TailwindCSS configuration
- `frontend/postcss.config.js` - PostCSS configuration
- `frontend/index.html` - HTML entry point
- `frontend/src/main.tsx` - React entry point
- `frontend/src/index.css` - Global styles with Tailwind
- `frontend/src/App.tsx` - Main App component with routing
- `frontend/src/pages/Dashboard.tsx` - Dashboard page with placeholder UI
- `frontend/src/api/client.ts` - Axios HTTP client
- `frontend/src/api/worksites.ts` - Worksite API functions
- `frontend/src/api/temperature.ts` - Temperature API functions

**Documentation:**
- `README.md` - Comprehensive setup and architecture documentation

### Files Modified

- `README.md` - Updated from basic title to comprehensive documentation

---

## C. CURRENT PROJECT STATE

### Working

- ✅ **Backend compilation** - Maven build succeeds (`mvn clean compile`)
- ✅ **Project structure** - Complete modular monolith structure
- ✅ **Domain models** - All entities defined with JPA annotations
- ✅ **DTOs** - All DTOs defined with conversion methods
- ✅ **API contracts** - All REST endpoints defined in controllers
- ✅ **Service interfaces** - All service interfaces defined
- ✅ **Repository interfaces** - JPA repositories defined
- ✅ **Database schema** - Flyway migration for worksites and tasks
- ✅ **Configuration** - Application YAML with environment variable support
- ✅ **Docker setup** - Docker Compose for PostgreSQL and backend
- ✅ **Frontend structure** - React + TypeScript + Vite + TailwindCSS setup
- ✅ **Frontend API client** - Axios client with typed interfaces
- ✅ **Frontend placeholder UI** - Dashboard with basic layout

### Partially Implemented

- ⚠️ **FortyGuard adapter** - Interfaces defined, implementation needed
- ⚠️ **Service implementations** - Interfaces defined, implementations needed
- ⚠️ **Risk engine** - Domain model defined, calculation logic needed
- ⚠️ **AI integration** - Spring AI dependency added, prompt engineering needed
- ⚠️ **Frontend chart** - Placeholder UI, Recharts integration needed
- ⚠️ **Frontend API integration** - Client functions defined, actual API calls needed

### Not Implemented

- ❌ **FortyGuard HTTP client** - Actual HTTP calls to FortyGuard API
- ❌ **Async job handling** - Submit/poll/wait pattern implementation
- ❌ **Risk calculation logic** - Threshold rules, critical window detection
- ❌ **Task intersection logic** - Mapping tasks to critical windows
- ❌ **AI prompt engineering** - Grounded prompts for recommendations
- ❌ **What-if comparison** - Baseline vs proposed assessment logic
- ❌ **Interactive temperature chart** - Recharts implementation with overlays
- ❌ **Error handling** - Comprehensive error handling and fallbacks
- ❌ **Testing** - Unit tests, integration tests
- ❌ **Frontend state management** - React state for worksites, tasks, scenarios

---

## D. WHAT YOU MUST IMPLEMENT NEXT

### P0 - Absolutely Required for Demo

**Day 1-2: FortyGuard Integration**
1. Implement `FortyGuardClient` with HTTP calls to FortyGuard API
2. Implement async job pattern (submit → poll → result)
3. Implement `TemperatureDataProvider` with response normalization
4. Create mock provider for development/testing
5. Validate API coverage, units, time behavior (Day 2 spike)
6. **Critical**: Determine if forecast data is available (document says public API is U.S.-only and future dates unsupported)

**Day 3: Service Layer**
1. Implement `WorksiteService` with CRUD operations
2. Implement `TaskService` with task creation and retrieval
3. Implement `TemperatureService` calling FortyGuard adapter
4. Implement `JobService` for tracking async operations
5. Add basic error handling and logging

**Day 4: Risk Engine**
1. Implement deterministic risk calculation rules
2. Define explicit temperature thresholds (document heat index guidelines)
3. Implement critical window detection algorithm
4. Implement task intersection logic (which tasks overlap critical windows)
5. Write unit tests for risk boundaries and calculations

**Day 5: Temperature API & Frontend Integration**
1. Implement backend endpoint `/api/worksites/{id}/temperature` returning chart-ready data
2. Implement frontend API calls to fetch worksites and temperature data
3. Implement interactive temperature chart with Recharts
4. Add risk threshold overlay on chart
5. Add task interval overlay on chart
6. Implement tooltips showing exact timestamp and temperature

**Day 6: AI Integration**
1. Implement Spring AI integration with OpenAI-compatible model
2. Design grounded prompts for risk explanation
3. Implement structured output validation
4. Implement AI failure fallback (show deterministic assessment without AI)
5. Add AI recommendations to frontend

**Day 7: What-if Feature**
1. Implement `ScenarioService` with baseline/proposed assessment
2. Implement backend endpoint `/api/worksites/{id}/scenarios`
3. Implement frontend What-if UI (change task time)
4. Implement before/after comparison display
5. Update chart to show visual comparison
6. **Critical**: Ensure What-if updates both numerical and visual timeline

### P1 - Important if Time Permits

1. **Enhanced error handling** - Graceful degradation when FortyGuard API fails
2. **Data caching** - Cache FortyGuard responses to avoid repeated API calls
3. **Timezone handling** - Proper timezone conversion and display
4. **Unit consistency** - Ensure Celsius throughout, explicit conversion if needed
5. **Loading states** - Better loading indicators for async operations
6. **Empty states** - Handle no worksites, no tasks, no temperature data
7. **Partial data handling** - Handle missing/partial hourly observations

### P2 - Optional/Polish

1. **Additional chart features** - Zoom, pan, custom tooltips
2. **Task management UI** - Full CRUD for tasks in frontend
3. **Worksite management UI** - Full CRUD for worksites in frontend
4. **Export functionality** - Export risk assessments as PDF
5. **Historical data** - Show historical temperature patterns
6. **Mobile responsiveness** - Optimize for mobile devices
7. **Accessibility** - ARIA labels, keyboard navigation
8. **Performance optimization** - Code splitting, lazy loading

---

## E. RISKS

### Risk 1: FortyGuard API Limitations
- **Likelihood**: HIGH (document explicitly states public API is U.S.-only and future dates unsupported)
- **Impact**: CRITICAL (core feature depends on temperature data)
- **Mitigation**: 
  - Day 2 spike to validate actual hackathon API capabilities
  - If forecast unavailable, adapt to show historical/same-day data with explicit labeling
  - Implement robust mock provider for development
  - Never fabricate forecast data - be honest about data basis

### Risk 2: Async Job Pattern Complexity
- **Likelihood**: MEDIUM (FortyGuard uses submit/poll pattern which adds complexity)
- **Impact**: HIGH (affects all temperature data retrieval)
- **Mitigation**:
  - Implement job tracking in database
  - Show progress in UI
  - Implement timeout handling
  - Use cached responses for repeated requests
  - Have fallback to mock data if API fails

### Risk 3: AI Reliability
- **Likelihood**: MEDIUM (AI responses can be inconsistent or fail)
- **Impact**: MEDIUM (recommendations are important but not core to demo)
- **Mitigation**:
  - Keep risk calculation deterministic (separate from AI)
  - Implement structured output validation
  - Have fallback to show deterministic assessment without AI
  - Never let AI override calculated thresholds
  - Ground AI prompts in calculated data only

### Risk 4: Time Constraints (7 Days)
- **Likelihood**: HIGH (hackathon timeline is aggressive)
- **Impact**: CRITICAL (incomplete features will fail demo)
- **Mitigation**:
  - Strictly follow P0 priorities
  - Cut scope aggressively if behind schedule
  - Focus on end-to-end flow over polish
  - Use mock data if API integration takes too long
  - Prioritize working demo over perfect implementation

### Risk 5: Demo Failure
- **Likelihood**: LOW (with proper preparation)
- **Impact**: CRITICAL (hackathon judging depends on demo)
- **Mitigation**:
  - Practice demo flow multiple times
  - Have backup data/scenarios ready
  - Test in incognito mode
  - Prepare 3-minute video as backup
  - Ensure FortyGuard integration is visibly central

---

## F. 7-DAY EXECUTION PLAN

### Day 1: Foundation & FortyGuard Spike
- **Morning**: 
  - Set up local development environment
  - Start PostgreSQL (Docker)
  - Configure API keys
  - Verify backend starts
- **Afternoon**:
  - Get FortyGuard API access
  - Test one live endpoint
  - Validate coverage, units, time behavior
  - Determine if forecast data is available
  - **Deliverable**: Integration assumptions confirmed

### Day 2: FortyGuard Adapter
- Implement `FortyGuardClient` HTTP client
- Implement async job abstraction (submit/poll/wait)
- Implement response normalization to internal models
- Create mock provider for development
- Test with both real and mock data
- **Deliverable**: Reliable domain provider

### Day 3: Domain & Persistence
- Implement service layer (Worksite, Task, Temperature, Job)
- Add basic CRUD operations
- Test database operations
- Seed sample data for testing
- **Deliverable**: Data persists, services work

### Day 4: Risk Engine
- Implement deterministic risk calculation rules
- Define temperature thresholds
- Implement critical window detection
- Implement task intersection logic
- Write unit tests for risk calculations
- **Deliverable**: Deterministic tests pass

### Day 5: Temperature API & Chart
- Implement temperature endpoint returning chart-ready data
- Implement frontend API integration
- Implement interactive temperature chart with Recharts
- Add risk threshold overlay
- Add task interval overlay
- Implement tooltips
- **Deliverable**: Frontend receives chart-ready data, visual heat story works

### Day 6: AI Integration
- Implement Spring AI integration
- Design grounded prompts
- Implement structured output validation
- Implement AI failure fallback
- Add AI recommendations to frontend
- **Deliverable**: Recommendations reliable

### Day 7: What-if & Hardening
- Implement scenario comparison logic
- Implement What-if backend endpoint
- Implement What-if UI (change task time)
- Implement before/after comparison
- Update chart for visual comparison
- Test end-to-end demo flow
- **Deliverable**: Signature feature works, MVP stable

### Buffer Day (if available):
- Deployment
- Demo practice
- Video recording
- Final polish

---

## G. HOW TO RUN

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- FortyGuard API key
- OpenAI API key (or compatible)

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
cd HeatSafe-AI

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start services
docker-compose up -d

# 4. Access application
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
# Health check: http://localhost:8080/actuator/health
```

### Option 2: Local Development

**Backend:**
```bash
# 1. Start PostgreSQL
docker run --name heatsafe-postgres \
  -e POSTGRES_PASSWORD=heatsafe \
  -e POSTGRES_DB=heatsafe \
  -e POSTGRES_USER=heatsafe \
  -p 5432:5432 \
  -d postgres:15-alpine

# 2. Configure environment
export DATABASE_URL=jdbc:postgresql://localhost:5432/heatsafe
export DATABASE_USERNAME=heatsafe
export DATABASE_PASSWORD=heatsafe
export FORTYGUARD_API_KEY=your_api_key
export OPENAI_API_KEY=your_openai_key

# 3. Run backend
mvn spring-boot:run
```

**Frontend:**
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Start development server
npm run dev
```

### Build for Production

```bash
# Backend
mvn clean package

# Frontend
cd frontend
npm run build
```

### Verify Setup

```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Check API endpoints (after implementation)
curl http://localhost:8080/api/worksites
```

### Troubleshooting

- **Backend won't start**: Check PostgreSQL is running, environment variables are set
- **Frontend won't start**: Run `npm install` in frontend directory
- **Database errors**: Check Flyway migrations ran successfully
- **API errors**: Check API keys are valid and have required permissions

---

## Summary

The HeatSafe AI project foundation is **complete and ready for core implementation**. The backend compiles successfully, the frontend structure is in place, and all interfaces are defined according to the engineering document specifications.

**Key achievements:**
- ✅ Modular monolith architecture implemented
- ✅ All domain models and DTOs defined
- ✅ API contracts match document specifications
- ✅ Database schema created with migrations
- ✅ Docker infrastructure ready
- ✅ Frontend foundation with React + TypeScript + TailwindCSS
- ✅ Comprehensive documentation

**Next steps:** Begin P0 implementation starting with FortyGuard integration (Day 1-2), following the 7-day execution plan strictly.

**Critical path:** FortyGuard API integration → Risk engine → Temperature chart → AI → What-if feature.

**Biggest risk:** FortyGuard API limitations (forecast data availability) - validate this on Day 2.

The project is positioned for successful hackathon completion with focused implementation of the P0 features.
