# HeatSafe AI

AI-powered operational heat-risk decision-support application for the FortyGuard Hackathon '26.

## Overview

HeatSafe combines FortyGuard heat/temperature intelligence with operational context (worksites, tasks, schedules, exposure windows) to identify risk periods, map them to scheduled work, explain situations, recommend actions, and allow users to test alternative schedules through What-if scenarios.

## Architecture

- **Backend**: Spring Boot 3.2 (Java 17) - Modular Monolith
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Database**: PostgreSQL 15
- **External API**: FortyGuard tOS Enterprise API
- **AI**: Spring AI with OpenAI-compatible model

## Project Structure

```
HeatSafe-AI/
├── src/main/java/com/heatsafe/
│   ├── adapter/fortyguard/       # FortyGuard API adapter interfaces
│   ├── api/                       # REST controllers and DTOs
│   ├── domain/                    # Domain models (Worksite, Task, etc.)
│   └── service/                   # Service interfaces
├── src/main/resources/
│   ├── application.yml            # Main configuration
│   ├── application-dev.yml        # Development profile
│   └── db/migration/              # Flyway database migrations
├── frontend/                      # React frontend
│   ├── src/
│   │   ├── api/                   # API client functions
│   │   ├── pages/                 # React components
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml             # Docker orchestration
├── Dockerfile                     # Backend container
└── pom.xml                        # Maven configuration
```

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- FortyGuard API key
- OpenAI API key (or compatible)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HeatSafe-AI
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Backend: http://localhost:8080
   - Frontend: http://localhost:3000
   - Health check: http://localhost:8080/actuator/health

## Local Development Setup

### Backend Setup

1. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run --name heatsafe-postgres -e POSTGRES_PASSWORD=heatsafe -e POSTGRES_DB=heatsafe -e POSTGRES_USER=heatsafe -p 5432:5432 -d postgres:15-alpine
   ```

2. **Configure environment**
   ```bash
   export DATABASE_URL=jdbc:postgresql://localhost:5432/heatsafe
   export DATABASE_USERNAME=heatsafe
   export DATABASE_PASSWORD=heatsafe
   export FORTYGUARD_API_KEY=your_api_key
   export OPENAI_API_KEY=your_openai_key
   ```

3. **Run the backend**
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Worksites
- `GET /api/worksites` - List all worksites
- `POST /api/worksites` - Create a worksite
- `GET /api/worksites/{id}` - Get worksite details

### Tasks
- `POST /api/worksites/{id}/tasks` - Create a task for a worksite

### Temperature
- `GET /api/worksites/{id}/temperature` - Get temperature series for chart

### Heat Risk
- `GET /api/worksites/{id}/heat-risk` - Get heat risk assessment

### Scenarios (What-if)
- `POST /api/worksites/{id}/scenarios` - Evaluate a What-if scenario

### Jobs
- `GET /api/jobs/{id}` - Get long-running job status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL JDBC URL | jdbc:postgresql://localhost:5432/heatsafe |
| `DATABASE_USERNAME` | Database username | heatsafe |
| `DATABASE_PASSWORD` | Database password | heatsafe |
| `FORTYGUARD_API_KEY` | FortyGuard API key | (required) |
| `FORTYGUARD_BASE_URL` | FortyGuard API base URL | https://api.fortyguard.com |
| `OPENAI_API_KEY` | OpenAI API key | (required) |
| `OPENAI_BASE_URL` | OpenAI API base URL | https://api.openai.com/v1 |
| `AI_MODEL` | AI model to use | gpt-4o |
| `SERVER_PORT` | Backend server port | 8080 |
| `SPRING_PROFILE` | Spring profile | dev |

## Development Notes

### Service Implementation Status

The following service interfaces are defined but require implementation:

- `WorksiteService` - CRUD operations for worksites
- `TaskService` - Task management
- `TemperatureService` - Temperature data retrieval from FortyGuard
- `HeatRiskService` - Risk assessment calculations
- `ScenarioService` - What-if scenario evaluation
- `JobService` - Long-running job status tracking

### FortyGuard Adapter

The FortyGuard adapter interfaces are defined:
- `FortyGuardClient` - Async job submission and polling
- `TemperatureDataProvider` - Temperature data retrieval

Implementation should handle:
- Async submit → poll → result pattern
- Response normalization to internal models
- Mock provider for development/testing

### Risk Engine

The risk engine should be deterministic:
- Define explicit, testable thresholds
- Calculate critical windows
- Identify affected tasks
- Keep AI separate from risk calculation

## Testing

```bash
# Backend tests
mvn test

# Frontend tests (when implemented)
cd frontend
npm test
```

## Building for Production

```bash
# Backend
mvn clean package

# Frontend
cd frontend
npm run build
```

## Demo Flow

1. Open HeatSafe and select a worksite
2. View the interactive temperature timeline
3. Identify critical windows and overlapping tasks
4. Review AI recommendations
5. Run What-if scenario by moving task time
6. Compare before/after risk assessments
7. Make operational decision

Target demo duration: 2:20–2:40 minutes

## Security

- API keys are server-side only (never exposed to frontend)
- Never commit secrets to repository
- Use environment variables for sensitive configuration
- FortyGuard API key stays in backend

## Hackathon Submission Checklist

- [ ] Project title and one-line pitch finalized
- [ ] Industrial & Enterprise track selected
- [ ] FortyGuard integration is visibly central
- [ ] Interactive temperature timeline works
- [ ] Risk + task intersection works
- [ ] What-if feature works
- [ ] AI recommendations grounded in calculated data
- [ ] Live demo works in incognito
- [ ] 3-minute video ready
- [ ] Repository contains no API keys
- [ ] AI tools honestly disclosed
- [ ] README explains architecture and setup

## License

Proprietary - Hackathon Project

## Contact

For questions during the hackathon, contact the development team.