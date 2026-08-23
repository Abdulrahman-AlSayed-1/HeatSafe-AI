# HeatSafe AI - UX Concept Document

**Date**: August 23, 2026  
**Hackathon**: FortyGuard Hackathon '26  
**Purpose**: Complete UX design for MVP implementation

---

## 1. DEFINE THE USER

### Primary User

**Who**: Construction Site Supervisor / Operations Manager

**Name**: Alex (fictional representative)

**Context**: Alex manages a construction crew of 15 workers at an outdoor site in Dubai. The crew performs various tasks throughout the day: concrete pouring, steel welding, excavation, equipment operation, and general labor.

### Problem Alex Experiences

Alex faces a critical operational challenge:

- **Heat is unpredictable**: Temperature varies significantly throughout the day. Some hours are safe, others are dangerous.
- **Tasks are scheduled by time**: Work is scheduled based on project timelines, not heat conditions.
- **Workers are at risk**: When high heat overlaps with scheduled tasks, workers face heat stress, reduced productivity, and potential health incidents.
- **Decisions are reactive**: Alex only realizes there's a problem when workers show signs of heat exhaustion. By then, it's too late.
- **No data-driven tools**: Alex relies on weather apps that show current temperature but don't map heat to specific tasks or provide actionable recommendations.

### Why Alex Opens HeatSafe AI

Alex opens HeatSafe AI at 7:00 AM before the workday begins. He wants to:

1. **See today's heat pattern**: Understand when temperatures will rise and fall throughout the day
2. **Identify dangerous periods**: Know exactly which hours are too hot for outdoor work
3. **Check scheduled tasks**: See which tasks overlap with dangerous heat periods
4. **Make adjustments**: Reschedule high-risk tasks to safer times
5. **Protect workers**: Ensure no worker is exposed to dangerous heat conditions

### Information Alex Provides

Alex provides:

- **Worksite location**: Dubai Marina construction site (coordinates: 25.08°N, 55.14°E)
- **Scheduled tasks for today**:
  - 8:00–10:00 AM: Concrete pouring (2 hours, high exertion)
  - 10:30 AM–12:30 PM: Steel welding (2 hours, high exertion)
  - 1:00–3:00 PM: Excavation (2 hours, moderate exertion)
  - 3:30–5:30 PM: Equipment operation (2 hours, low exertion)
- **Task exposure types**: High exertion tasks require more frequent breaks in heat

### What HeatSafe AI Does for Alex

HeatSafe AI:

1. **Fetches temperature data**: Retrieves hourly temperature data for the worksite location from FortyGuard API
2. **Calculates risk**: Determines heat risk level for each hour based on temperature and humidity (heat index)
3. **Identifies critical windows**: Marks time periods where heat index exceeds safe thresholds (e.g., >35°C for high exertion tasks)
4. **Maps tasks to risk**: Shows which scheduled tasks overlap with critical windows
5. **Provides recommendations**: Suggests rescheduling high-risk tasks to safer times
6. **Enables What-if testing**: Allows Alex to test alternative schedules and compare risk assessments

### Decision Alex Ultimately Wants to Make

Alex's decision: **"Should I reschedule the 10:30 AM steel welding task to a safer time?"**

HeatSafe AI provides the data and analysis to make this decision confidently.

---

### Realistic User Scenario (End-to-End)

**7:00 AM**: Alex arrives at the construction site office. He opens HeatSafe AI on his laptop.

**7:02 AM**: Alex selects the "Dubai Marina" worksite from his list of managed sites.

**7:03 AM**: HeatSafe AI displays today's temperature timeline. Alex sees temperatures will rise from 28°C at 8:00 AM to 42°C at 2:00 PM, then drop to 36°C by 5:00 PM.

**7:04 AM**: HeatSafe AI highlights the critical window: 11:00 AM–3:00 PM (heat index >38°C). This is marked in red on the timeline.

**7:05 AM**: Alex sees his scheduled tasks overlaid on the timeline. The steel welding task (10:30 AM–12:30 PM) partially overlaps with the critical window. The excavation task (1:00–3:00 PM) fully overlaps.

**7:06 AM**: HeatSafe AI displays a risk assessment: "HIGH RISK - 2 tasks overlap critical window. 8 workers affected."

**7:07 AM**: AI recommendations appear: "1. Move steel welding to 8:00 AM–10:00 AM. Increase cooling measures for excavation. Consider splitting excavation into two 1-hour sessions with breaks."

**7:08 AM**: Alex clicks "Test What-if" and drags the steel welding task to 8:00 AM–10:00 AM.

**7:09 AM**: HeatSafe AI recalculates. The new assessment shows: "MODERATE RISK - 1 task overlaps critical window. 4 workers affected."

**7:10 AM**: Alex compares the before/after: Original (HIGH, 8 workers affected) vs. Proposed (MODERATE, 4 workers affected).

**7:11 AM**: Alex clicks "Apply Changes" to reschedule the steel welding task.

**7:12 AM**: Alex prints the updated schedule and briefs the crew on the new timing and heat safety measures.

**7:15 AM**: Alex closes HeatSafe AI, confident that workers are protected from dangerous heat conditions.

---

## 2. DEFINE THE MAIN USER JOURNEY

### Complete Flow

```
User opens HeatSafe AI
↓
[Screen 1: Worksite Selection]
User sees: List of worksites they manage
User action: Click on a worksite
Backend: Fetch worksite details, scheduled tasks
Next: Main Dashboard
↓
[Screen 2: Main Dashboard]
User sees: Temperature timeline, critical windows, scheduled tasks, risk assessment
User action: Review current situation
Backend: Real-time temperature data from FortyGuard, risk calculation
Next: User can explore or take action
↓
[User Action: Explore Details]
User action: Hover over timeline to see specific hour temperature
System: Shows tooltip with exact temperature, heat index, risk level
Next: User continues exploring or takes action
↓
[User Action: View AI Recommendations]
User action: Click "View Recommendations" button
System: Displays AI-generated recommendations based on calculated risk
Next: User can accept recommendations or test What-if
↓
[User Action: Test What-if Scenario]
User action: Click "Test What-if" button
System: Opens scenario editor
User action: Change task time (drag on timeline or input new time)
Backend: Recalculates risk assessment for proposed schedule
System: Displays before/after comparison
Next: User can apply changes or test another scenario
↓
[User Action: Apply Changes]
User action: Click "Apply Changes" button
Backend: Updates task schedule in database
System: Confirms changes, displays updated dashboard
Next: User can export schedule or exit
↓
[User Action: Export Schedule]
User action: Click "Export Schedule" button
System: Downloads PDF with updated schedule and heat safety notes
Next: User closes app or selects another worksite
```

### Step-by-Step Detail

**Step 1: User opens HeatSafe AI**
- **What user sees**: Login screen (if authentication required) or direct worksite list
- **What user can click**: Worksites in list
- **Information displayed**: Worksite names, locations, current temperature
- **What happens in backend**: Fetches list of worksites from database
- **What happens next**: User selects a worksite

**Step 2: User selects worksite**
- **What user sees**: Loading spinner, then Main Dashboard
- **What user can click**: Timeline, tasks, recommendations, What-if button
- **Information displayed**: Temperature timeline, critical windows, tasks, risk level
- **What happens in backend**: 
  - Fetches temperature data from FortyGuard API (async job pattern)
  - Calculates risk assessment
  - Fetches scheduled tasks from database
  - Identifies task-critical window intersections
- **What happens next**: User reviews current situation

**Step 3: User explores timeline**
- **What user sees**: Interactive chart with temperature line, risk zones, task bars
- **What user can click**: Hover over any point on timeline, click on tasks
- **Information displayed**: 
  - Tooltip: timestamp, temperature, heat index, risk level
  - Task details: name, time, duration, exposure type, affected workers
- **What happens in backend**: No backend call (data already loaded)
- **What happens next**: User continues exploring or takes action

**Step 4: User views AI recommendations**
- **What user sees**: Recommendations panel with AI-generated suggestions
- **What user can click**: Each recommendation to see details
- **Information displayed**: 
  - Recommendation text (e.g., "Move task X to time Y")
  - Reasoning (e.g., "Reduces overlap from 2 hours to 0 hours")
  - Expected impact (e.g., "Risk level drops from HIGH to MODERATE")
- **What happens in backend**: AI generates recommendations based on calculated risk data
- **What happens next**: User can accept recommendations or test What-if

**Step 5: User tests What-if scenario**
- **What user sees**: Scenario editor with timeline and task list
- **What user can click**: Drag task bars on timeline, or input new times
- **Information displayed**: 
  - Original schedule (baseline)
  - Proposed schedule (with changes)
  - Before/after risk comparison
- **What happens in backend**: 
  - Recalculates risk assessment for proposed schedule
  - Compares baseline vs proposed
  - Returns updated risk level and affected tasks
- **What happens next**: User can apply changes or test another scenario

**Step 6: User applies changes**
- **What user sees**: Confirmation dialog with summary of changes
- **What user can click**: Confirm or Cancel
- **Information displayed**: 
  - Tasks being rescheduled
  - New risk assessment
  - Expected improvement
- **What happens in backend**: 
  - Updates task schedules in database
  - Logs the change
- **What happens next**: Updated dashboard displays

**Step 7: User exports schedule**
- **What user sees**: Export options (PDF, CSV)
- **What user can click**: Export format
- **Information displayed**: Downloaded file with schedule and heat safety notes
- **What happens in backend**: Generates PDF/CSV with schedule and risk summary
- **What happens next**: User closes app or selects another worksite

---

## 3. DESIGN THE MVP SCREENS

### Screen 1: Worksite Selection (Landing)

**SCREEN NAME**: Worksite Selection

**Purpose**: Allow user to select which worksite to analyze

**User goal**: Choose a worksite to view heat risk assessment

**What appears on screen**:
- Header with "HeatSafe AI" logo
- List of worksites managed by user
- Each worksite shows: name, location, current temperature, last updated time
- "Add Worksite" button (optional, for demo may use pre-seeded data)

**Main components**:
- Header bar (logo, user profile)
- Worksite list (cards or table)
- Search/filter bar (optional)
- "Add Worksite" button

**Primary CTA**: Click on a worksite card

**Secondary actions**: Search worksites, add new worksite

**Inputs**: None (selection only)

**Outputs**: Selected worksite ID

**Important states**:
- **Loading**: Spinner while fetching worksites
- **Success**: Worksites displayed
- **Empty**: "No worksites configured. Add a worksite to get started."
- **Error**: "Failed to load worksites. Please try again."

---

### Screen 2: Main Dashboard

**SCREEN NAME**: Heat Risk Dashboard

**Purpose**: Display current heat risk assessment for selected worksite

**User goal**: Understand heat risk, see affected tasks, take action

**What appears on screen**:
- Header with worksite name and current risk level
- Interactive temperature timeline chart
- Critical windows highlighted (red zones)
- Scheduled tasks overlaid on timeline
- Risk assessment summary panel
- AI recommendations panel
- "Test What-if" button
- "Export Schedule" button

**Main components**:
- Header (worksite name, current risk badge, date/time)
- Temperature timeline chart (Recharts)
- Risk assessment panel (risk level, score, affected tasks, critical windows)
- Task list (name, time, duration, exposure type, risk status)
- AI recommendations panel (collapsible)
- Action buttons (Test What-if, Export Schedule)

**Primary CTA**: "Test What-if" button

**Secondary actions**: Hover timeline for details, click tasks for details, view recommendations, export schedule

**Inputs**: None (display only, actions trigger other screens)

**Outputs**: Visual representation of heat risk and task schedule

**Important states**:
- **Loading**: Spinner while fetching temperature data from FortyGuard
- **Success**: Dashboard fully populated with data
- **Empty**: "No tasks scheduled for this worksite today."
- **Error**: "Failed to load temperature data. Using cached data." or "No temperature data available."

---

### Screen 3: What-if Scenario Editor

**SCREEN NAME**: Scenario Editor

**Purpose**: Allow user to test alternative task schedules and compare risk

**User goal**: Find a schedule that minimizes risk while meeting operational needs

**What appears on screen**:
- Header with "What-if Scenario" title
- Two timelines side-by-side:
  - Left: Original schedule (baseline)
  - Right: Proposed schedule (editable)
- Task list with time inputs
- Before/after risk comparison panel
- "Apply Changes" button
- "Cancel" button

**Main components**:
- Header (title, worksite name)
- Comparison view (baseline vs proposed)
- Timeline editor (drag tasks or input times)
- Task list with editable time fields
- Risk comparison panel (baseline risk, proposed risk, improvement)
- Action buttons (Apply Changes, Cancel)

**Primary CTA**: "Apply Changes" button

**Secondary actions**: Drag tasks on timeline, edit task times manually, cancel

**Inputs**: Task start times, task durations

**Outputs**: Updated risk assessment for proposed schedule

**Important states**:
- **Loading**: Spinner while recalculating risk
- **Success**: Comparison displayed
- **Empty**: No tasks to edit
- **Error**: "Failed to recalculate risk. Please try again."

---

### Screen 4: Result/Confirmation

**SCREEN NAME**: Changes Applied

**Purpose**: Confirm that schedule changes were saved

**User goal**: Verify changes and understand new risk level

**What appears on screen**:
- Header with "Changes Applied" success message
- Summary of changes (tasks rescheduled)
- New risk assessment
- "Return to Dashboard" button
- "Export Updated Schedule" button

**Main components**:
- Success message
- Change summary
- New risk badge
- Action buttons

**Primary CTA**: "Return to Dashboard" button

**Secondary actions**: Export updated schedule

**Inputs**: None

**Outputs**: Confirmation of saved changes

**Important states**:
- **Success**: Changes saved confirmation
- **Error**: "Failed to save changes. Please try again."

---

## 4. VISUALIZE THE MAIN DASHBOARD/HOME SCREEN

### Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ HeatSafe AI    [Dubai Marina]           [HIGH RISK]  [User]   ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ RISK ASSESSMENT PANEL (Top Priority - Most Visual Attention)   │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Current Risk: HIGH                                           ││
│ │ Risk Score: 8.5/10                                           ││
│ │ Critical Windows: 11:00 AM – 3:00 PM (4 hours)              ││
│ │ Affected Tasks: 2 tasks, 8 workers                           ││
│ │ [View Details]                                               ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ TEMPERATURE TIMELINE CHART (Core Feature - Large Visual Space) │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 8 AM    10 AM   12 PM   2 PM    4 PM    6 PM                 ││
│ │ ┌───────┬───────┬───────┬───────┬───────┬───────┐            ││
│ │ │ 28°C  │ 32°C  │ 38°C  │ 42°C  │ 36°C  │ 30°C  │            ││
│ │ └───────┴───────┴───────┴───────┴───────┴───────┘            ││
│ │         [Red zone: 11 AM - 3 PM - Critical Window]          ││
│ │         [Task 1: Concrete 8-10 AM] [Task 2: Welding 10:30-12:30]│
│ │         [Task 3: Excavation 1-3 PM] [Task 4: Equipment 3:30-5:30]││
│ └─────────────────────────────────────────────────────────────┘│
│ [Hover for details]                                            │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ AI RECOMMENDATIONS PANEL (Secondary - Collapsible)             │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ 💡 AI Recommendations                                        ││
│ │ 1. Move steel welding to 8:00 AM–10:00 AM                   ││
│ │    Reduces overlap from 2 hours to 0 hours                  ││
│ │    Expected: Risk drops from HIGH to MODERATE               ││
│ │ 2. Increase cooling measures for excavation task           ││
│ │    Provide shade, water, and 15-min breaks every hour       ││
│ │ 3. Consider splitting excavation into two 1-hour sessions   ││
│ │    Reduces continuous exposure time                         ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ ACTION BUTTONS (Bottom - Primary CTA)                          │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ [Test What-if Scenario]  [Export Schedule]  [Refresh Data] ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy Explanation

**Most Visual Attention (Largest, Top, Color-Coded)**
- **Risk Assessment Panel**: Red badge for HIGH risk, large text. This is the most important information the user needs to see immediately.
- **Temperature Timeline Chart**: Large interactive chart with color-coded zones. This is the core feature that differentiates HeatSafe AI from basic weather apps.

**Secondary Attention**
- **AI Recommendations Panel**: Collapsible to avoid clutter, but prominent when expanded. Provides actionable guidance.
- **Task Overlays on Timeline**: Color-coded bars showing which tasks are at risk.

**Tertiary Attention**
- **Action Buttons**: Bottom of screen, clear CTA for next action.
- **Header**: Context (worksite name, user profile).

---

## 5. VISUALIZE THE CORE HEATSAFE AI EXPERIENCE

### Exact Flow

User enters/selects worksite
↓
HeatSafe AI processes:
  - Fetches worksite location and scheduled tasks from database
  - Submits temperature analysis request to FortyGuard API (async job)
  - Polls for job completion
  - Receives hourly temperature data for the worksite
  - Calculates heat index for each hour
  - Determines risk level based on temperature thresholds
  - Identifies critical windows (periods where heat index exceeds safe thresholds)
  - Maps scheduled tasks to critical windows
  - Identifies which tasks overlap with critical windows
  - Counts affected workers
↓
AI determines:
  - Overall risk level (LOW/MODERATE/HIGH/CRITICAL)
  - Risk score (0-10)
  - Critical windows (start time, end time, duration)
  - Affected tasks (task names, overlap duration)
  - Affected workers (count)
↓
System displays:
  - Risk assessment panel with risk level badge (color-coded)
  - Temperature timeline chart with:
    - Temperature line graph
    - Heat index overlay
    - Critical windows highlighted in red
    - Safe zones in green
    - Task bars overlaid with colors indicating risk status
  - Task list with risk status for each task
  - AI recommendations panel with actionable suggestions
↓
User receives:
  - Clear understanding of current heat risk
  - Visual representation of when heat will be dangerous
  - Knowledge of which tasks are at risk
  - Specific recommendations to reduce risk
↓
User can take action:
  - Click "Test What-if" to test alternative schedules
  - Drag tasks on timeline to new times
  - See before/after risk comparison
  - Apply changes to reschedule tasks
  - Export updated schedule

### Concrete Example

**User Action**: Alex selects "Dubai Marina" worksite

**HeatSafe AI Processing**:
1. Fetches worksite: Dubai Marina (25.08°N, 55.14°E)
2. Fetches tasks: 4 tasks scheduled for today
3. Calls FortyGuard API: Submit analysis request for location and time window (today 6 AM – 6 PM)
4. Polls for completion: Job ID returned, poll every 5 seconds
5. Receives data: Hourly temperature array [28, 30, 32, 35, 38, 40, 42, 41, 39, 36, 34, 31, 29]
6. Calculates heat index: Adjusts for humidity (if available)
7. Determines risk: 
   - Thresholds: <30°C LOW, 30-35°C MODERATE, 35-38°C HIGH, >38°C CRITICAL
   - Critical windows: 11 AM – 3 PM (heat index >38°C)
8. Maps tasks:
   - Concrete pouring (8-10 AM): No overlap (safe)
   - Steel welding (10:30 AM-12:30 PM): 1.5 hours overlap (HIGH risk)
   - Excavation (1-3 PM): 2 hours overlap (CRITICAL risk)
   - Equipment operation (3:30-5:30 PM): No overlap (safe)
9. Counts affected workers: 8 workers across 2 tasks

**AI Determination**:
- Risk level: HIGH
- Risk score: 8.5/10
- Critical windows: 11:00 AM – 3:00 PM (4 hours)
- Affected tasks: Steel welding, Excavation
- Affected workers: 8

**System Display**:
- Red "HIGH RISK" badge in header
- Risk assessment panel: "HIGH RISK - 2 tasks overlap critical window. 8 workers affected."
- Temperature timeline: Red zone from 11 AM to 3 PM
- Task bars: Steel welding (yellow - partial overlap), Excavation (red - full overlap)
- AI recommendations: "Move steel welding to 8 AM. Increase cooling for excavation."

**User Receives**:
- Immediate understanding: "Today is dangerous between 11 AM and 3 PM"
- Specific knowledge: "Steel welding and excavation are at risk"
- Actionable guidance: "Move steel welding earlier, add cooling measures for excavation"

**User Action**:
- Clicks "Test What-if"
- Drags steel welding from 10:30 AM to 8:00 AM
- Sees comparison: Risk drops from HIGH to MODERATE
- Clicks "Apply Changes"
- Exports updated schedule

---

## 6. RESULT SCREEN

### After HeatSafe AI Produces Result

**Critical Information (Top, Large, Color-Coded)**
- Risk level badge: "HIGH RISK" (red background, white text)
- Risk score: "8.5/10" (large number)
- Critical windows: "11:00 AM – 3:00 PM" (time range)

**Risk/Status Indicator**
- Visual gauge or progress bar showing risk level
- Color-coded: Green (LOW), Yellow (MODERATE), Orange (HIGH), Red (CRITICAL)
- Label: "Current Risk Level"

**Explanation**
- Brief text explaining why risk is at this level
- Example: "Temperatures will exceed 38°C between 11 AM and 3 PM, creating dangerous heat conditions for outdoor work."

**AI Recommendation**
- Numbered list of 2-3 actionable recommendations
- Each recommendation includes:
  - Action (e.g., "Move steel welding to 8:00 AM")
  - Reason (e.g., "Reduces overlap from 2 hours to 0 hours")
  - Expected impact (e.g., "Risk drops from HIGH to MODERATE")
- Collapsible panel (expandable for details)

**Recommended Action**
- Primary CTA button: "Test What-if Scenario"
- Secondary CTA button: "Export Schedule"
- Tertiary: "Refresh Data"

**Supporting Information**
- Task list table:
  - Task name
  - Scheduled time
  - Duration
  - Exposure type (high/moderate/low)
  - Risk status (safe/at risk)
  - Affected workers count
- Temperature summary:
  - Max temperature today
  - Time of max temperature
  - Average temperature
- Historical comparison (optional): "Today is 5°C hotter than yesterday at this time"

**Optional Details**
- Detailed temperature data table (hourly breakdown)
- Heat index calculation details
- Risk threshold definitions
- Data source: "Data from FortyGuard API"
- Last updated timestamp

### User Understanding Within Seconds

A user should be able to understand the result within 3-5 seconds by scanning:

1. **Risk badge** (red = dangerous)
2. **Critical windows** (11 AM – 3 PM)
3. **Affected tasks** (2 tasks)
4. **Primary recommendation** (move steel welding)

This provides immediate context without requiring deep reading.

---

## 7. AI INTERACTION

### Where the AI Appears

The AI appears in the **AI Recommendations Panel** on the Main Dashboard. This is a collapsible panel located below the temperature timeline chart.

### What the User Can Ask/Do

The user does not "ask" the AI questions. Instead, the AI **proactively generates recommendations** based on the calculated risk data.

The user can:
- Expand/collapse the recommendations panel
- Click on a recommendation to see more details
- Accept a recommendation (which triggers the What-if scenario with that change pre-applied)

### What Context the AI Receives

The AI receives the following context:

- **Worksite information**: Location, name, timezone
- **Temperature data**: Hourly temperatures, heat index, critical windows
- **Task information**: Task names, scheduled times, durations, exposure types, worker counts
- **Risk assessment**: Risk level, risk score, affected tasks, overlap durations
- **Thresholds**: Risk thresholds used for calculation

The AI does NOT receive:
- User personal information
- Historical data beyond current analysis
- Other worksites' data

### How the Answer is Displayed

The AI recommendations are displayed as:

```
💡 AI Recommendations

1. Move steel welding to 8:00 AM–10:00 AM
   Reduces overlap from 2 hours to 0 hours
   Expected: Risk drops from HIGH to MODERATE
   [Apply This Recommendation]

2. Increase cooling measures for excavation task
   Provide shade, water, and 15-min breaks every hour
   Expected: Reduces worker heat stress by 40%
   [View Details]

3. Consider splitting excavation into two 1-hour sessions
   Reduces continuous exposure time
   Expected: Risk drops from HIGH to MODERATE
   [View Details]
```

Each recommendation is:
- Numbered for easy reference
- Has a clear action
- Explains the reasoning
- Shows expected impact
- Has an action button (Apply or View Details)

### How the AI Relates to the Main Result

The AI recommendations are **secondary to the deterministic risk assessment**. The risk calculation is done by the deterministic risk engine (rules-based), not by the AI.

The AI's role is to:
- **Explain** the situation in natural language
- **Suggest** specific actions based on the calculated risk
- **Provide context** for why certain actions are recommended

If the AI fails or produces unreliable output, the system falls back to showing only the deterministic risk assessment without recommendations. The core functionality (risk calculation, critical windows, task intersection) does not depend on the AI.

### No Chatbot

There is **no conversational chatbot** in the MVP. The AI interaction is strictly:
- Proactive recommendations (not user-initiated queries)
- Structured output (not free-form conversation)
- Grounded in calculated data (not hallucinated)

This aligns with the document's requirement: "Not a chatbot with temperature API attached."

---

## 8. COMPLETE SCREEN MAP

```
Worksite Selection (Landing)
   ↓
   [User selects worksite]
   ↓
Main Dashboard
   ├── Temperature Timeline (interactive)
   ├── Risk Assessment Panel
   ├── Task List
   ├── AI Recommendations (collapsible)
   └── Action Buttons
        ↓
        [User clicks "Test What-if"]
        ↓
Scenario Editor
   ├── Baseline Timeline (original)
   ├── Proposed Timeline (editable)
   ├── Task List with time inputs
   ├── Risk Comparison (before/after)
   └── Action Buttons
        ↓
        [User clicks "Apply Changes"]
        ↓
Changes Applied (Confirmation)
   ├── Success Message
   ├── Change Summary
   ├── New Risk Assessment
   └── Action Buttons
        ↓
        [User clicks "Return to Dashboard"]
        ↓
Main Dashboard (updated)
   ↓
   [User clicks "Export Schedule"]
   ↓
Export Dialog (modal)
   └── Download confirmation
```

### Screen Count: 4 main screens

1. **Worksite Selection** - Landing page
2. **Main Dashboard** - Core experience
3. **Scenario Editor** - What-if testing
4. **Changes Applied** - Confirmation

Plus 1 modal: **Export Dialog**

---

## 9. MVP VS OPTIONAL UX

### MUST HAVE (Required for Hackathon Demo)

- ✅ Worksite Selection screen with list of worksites
- ✅ Main Dashboard with temperature timeline chart
- ✅ Risk assessment panel with risk level badge
- ✅ Critical windows highlighted on timeline
- ✅ Task overlays on timeline showing schedule
- ✅ Task list with risk status
- ✅ AI recommendations panel (at least 2-3 recommendations)
- ✅ "Test What-if" button
- ✅ Scenario Editor with before/after comparison
- ✅ Ability to change task times (drag or input)
- ✅ Risk comparison (baseline vs proposed)
- ✅ "Apply Changes" button
- ✅ Changes Applied confirmation screen
- ✅ Export Schedule button (PDF download)
- ✅ Loading states for async operations
- ✅ Error handling with fallback messages

### SHOULD HAVE (Useful if Time Allows)

- Worksite creation/editing (for demo, may use pre-seeded data)
- Task creation/editing (for demo, may use pre-seeded data)
- Historical data comparison (today vs yesterday)
- Timezone support (for demo, assume single timezone)
- Detailed temperature data table (hourly breakdown)
- Heat index calculation details display
- Risk threshold definitions display
- Data source attribution
- Last updated timestamp
- Refresh Data button
- Search/filter for worksites
- Task details modal (click task for more info)

### NICE TO HAVE (Ignore Until MVP Complete)

- User authentication/login
- Multiple user roles (admin, viewer)
- Worksite map view
- Mobile responsive design (focus on desktop for demo)
- Dark mode
- Customizable risk thresholds
- Alert notifications (push/email)
- Integration with calendar systems
- Multi-day view (focus on single day for demo)
- Forecast data (only if FortyGuard confirms availability)
- Historical trend analysis
- Worker assignment to tasks
- Compliance reporting
- Audit log for schedule changes

---

## 10. DEMO FLOW

### Ideal 2:30 Minute Hackathon Demo

**0:00 – 0:15: Introduction**
- Presenter: "HeatSafe AI helps worksite managers protect workers from dangerous heat conditions by combining temperature intelligence with operational schedules."
- Screen: Worksite Selection page with list of worksites

**0:15 – 0:30: Problem Statement**
- Presenter: "The problem is that heat varies throughout the day, but tasks are scheduled by project timelines, not heat conditions. Workers get exposed to dangerous heat when tasks overlap with high-temperature periods."
- Screen: Still on Worksite Selection

**0:30 – 0:45: User Input**
- Presenter: "Let me show you how it works. I'll select the Dubai Marina construction site."
- Action: Click on "Dubai Marina" worksite
- Screen: Loading spinner, then Main Dashboard

**0:45 – 1:15: HeatSafe AI Intelligence**
- Presenter: "HeatSafe AI immediately fetches temperature data from FortyGuard, calculates the heat risk, and identifies critical windows. You can see the temperature timeline here, with the dangerous period highlighted in red from 11 AM to 3 PM."
- Screen: Main Dashboard with temperature timeline, red critical window
- Action: Hover over timeline to show tooltip with temperature details

**1:15 – 1:45: Result Display**
- Presenter: "The risk assessment shows HIGH risk because 2 of our 4 scheduled tasks overlap with the critical window. The steel welding task at 10:30 AM and the excavation task at 1 PM both overlap with dangerous heat conditions, affecting 8 workers."
- Screen: Risk Assessment panel (HIGH RISK badge), Task list with affected tasks highlighted

**1:45 – 2:00: AI Recommendations**
- Presenter: "HeatSafe AI provides recommendations to reduce risk. It suggests moving the steel welding task to 8 AM, which would eliminate the overlap and drop the risk from HIGH to MODERATE."
- Screen: Expand AI Recommendations panel, show first recommendation

**2:00 – 2:20: What-if Scenario**
- Presenter: "Let me test this recommendation using the What-if feature. I'll drag the steel welding task from 10:30 AM to 8 AM."
- Action: Click "Test What-if", drag task on timeline
- Screen: Scenario Editor with before/after comparison
- Presenter: "You can see the risk immediately drops from HIGH to MODERATE, and only 4 workers are affected instead of 8."

**2:20 – 2:30: Action and Value**
- Presenter: "I'll apply this change to protect our workers. HeatSafe AI makes it easy to make data-driven scheduling decisions that keep workers safe."
- Action: Click "Apply Changes", show confirmation
- Screen: Changes Applied confirmation with new risk assessment

**Total: 2:30 minutes**

### Demo Script Summary

1. **Problem** (0:15): Heat varies, tasks scheduled by timeline, workers at risk
2. **User Input** (0:15): Select worksite
3. **HeatSafe AI Intelligence** (0:30): Fetches temperature, calculates risk, identifies critical windows
4. **Result** (0:30): Shows HIGH risk, 2 tasks affected, 8 workers at risk
5. **AI Recommendation** (0:15): Suggests moving task to reduce risk
6. **What-if Test** (0:20): Tests recommendation, shows risk drops
7. **Action/Value** (0:10): Applies change, protects workers

### Why This Demo Works

- **Clear problem**: Everyone understands heat risk
- **Visible intelligence**: Temperature timeline with critical windows is visually compelling
- **Concrete result**: Risk level change (HIGH → MODERATE) is immediately understandable
- **Actionable**: User can actually make a decision and see the impact
- **Fast**: Under 3 minutes, fits hackathon constraints
- **FortyGuard central**: Temperature data is clearly from FortyGuard API

### Backup Demo (If API Fails)

If FortyGuard API is unavailable during demo:

- Use mock data pre-loaded in the system
- Explain: "For this demo, we're using sample temperature data. In production, this would come from FortyGuard API."
- Proceed with same flow using mock data
- Emphasize that the architecture supports real API integration

---

## Summary

This UX concept provides a concrete, visualizable design for the HeatSafe AI MVP. The design:

- **Focuses on the core user need**: Understanding heat risk and making scheduling decisions
- **Prioritizes the temperature timeline**: The most important visual element
- **Makes risk immediately visible**: Color-coded badges and critical windows
- **Provides actionable AI recommendations**: Grounded in calculated data, not hallucinations
- **Enables What-if testing**: The signature feature that differentiates HeatSafe AI
- **Fits the 3-minute demo**: Clear problem → intelligence → result → action flow

A UI/UX designer can create wireframes from this document without needing to reference the engineering specification. The design is strictly based on the requirements in the uploaded HeatSafe Engineering Package document.
