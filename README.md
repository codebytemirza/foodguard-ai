# FoodGuard AI: National Food Supply Prediction System

## 🚀 Project Overview

**FoodGuard AI** is an enterprise-grade, AI-powered predictive dashboard designed to safeguard Pakistan's food security. By leveraging **Agentic Workflows**, real-time API integrations, and advanced satellite data, FoodGuard AI predicts regional food shortages before they occur, enabling proactive logistics and policy interventions.

### 💡 The Problem
Food supply chains in Pakistan are often reactive, responding to shortages only after prices spike or reserves fail. Traditional systems lack the real-time integration of weather patterns, global market trends, and regional inventory.

### ✨ Our Solution
FoodGuard AI introduces an **autonomous AI Analyst** that "senses" the environment through multiple data channels, reasons about risks using the **Gemini 2.5 Flash** model, and provides structured, actionable reports with 90%+ confidence scores.

---

## 🧠 System Architecture Overview

The system is built on a **Modular Agentic Architecture**. It separates the "Brain" (AI Agent) from the "Senses" (API Tools) and the "Body" (Next.js Frontend).

### 📐 Architecture Diagram

```mermaid
graph TD
    User(["User/Analyst"]) -->|Initiates Analysis| Frontend["Next.js 15 Dashboard"]
    Frontend -->|POST Requests| API["Serverless API Layer"]
    API -->|Stream Events| Agent["FoodGuard AI Agent"]
    
    subgraph AI_AGENT_CORE ["Agentic Brain"]
        Agent -->|Invokes Tools| Tools{"Tool Hub"}
        Tools -->|Fetch| WeatherAPI["OpenWeatherMap"]
        Tools -->|Fetch| MarketAPI["World Bank Data"]
        Tools -->|Analyze| Satellite["NASA POWER/Satellite"]
        Tools -->|Query| Inventory["Warehouse System"]
    end

    Agent -->|Structured Output| API
    API -->|SSE Streaming| Frontend
    Frontend -->|Render| Map["Leaflet.js Map"]
    Frontend -->|Render| DataMatrix["Regional Data Matrix"]
```

---

## 🧩 Component Breakdown

### 1. AI Agent Core (`src/lib/agent/index.ts`)
* **Purpose**: The decision-making engine.
* **Responsibilities**: Orchestrates tool calls, analyzes data correlations, and generates structured JSON reports.
* **Key Tech**: LangChain.js, LangGraph, Gemini 2.5 Flash.

### 2. Data Collection Layer (`src/lib/agent/tools.ts`)
* **Purpose**: Fetches ground-truth data.
* **Responsibilities**: Real-time integration with OpenWeatherMap (local weather), World Bank (global prices), and NASA (crop health).
* **Key Tech**: Zod-validated tools, Fetch API.

### 3. Serverless API (`src/app/api/analyze/route.ts`)
* **Purpose**: Bridges the frontend and agent.
* **Responsibilities**: Manages the life-cycle of the analysis, providing real-time streaming updates via Server-Sent Events (SSE).
* **Key Tech**: Next.js App Router, ReadableStream.

### 4. Neobrutalist Dashboard (`src/components/Dashboard.tsx`)
* **Purpose**: Provides high-visibility data visualization.
* **Responsibilities**: Displays live analysis progress, regional risk maps, and an interactive AI chat assistant for deep-dives.
* **Key Tech**: Tailwind CSS, ShadCN UI, Lucide Icons, Leaflet.js.

---

## 🔗 Module Dependency Graph

```mermaid
graph LR
    subgraph UI_Layer
        D[Dashboard] --> DP[DataPanels]
        D --> MV[MapView]
    end

    subgraph Logic_Layer
        R[API Route] --> Agent[Agent Index]
        Agent --> Tools[Agent Tools]
    end

    D -.->|HTTP/SSE| R
    Tools -->|Internal Utils| Agent
```

---

## 🔄 Application Execution Flow

1.  **Selection**: User selects regions (e.g., Lahore, Multan) on the Dashboard.
2.  **Streaming Initialization**: The API initializes a stream and invokes the `structuredAgent`.
3.  **Parallel Sensing**: The agent concurrently fetches weather, market, and crop health data for each region.
4.  **Reasoning**: Gemini analyzes the delta between historical trends and current data.
5.  **Streaming Updates**: As tools complete, the UI updates "live" with status logs and tool data.
6.  **Finalization**: The agent generates a structured `FoodSecurityReport` (JSON), which triggers the final UI state (Map markers + Risk Matrix).

---

## ⏱️ Sequence Diagram (Agent Workflow)

This diagram illustrates how the Agent handles a single analysis request.

```mermaid
sequenceDiagram
    autonumber
    participant U as "User"
    participant F as "Next.js Dashboard"
    participant L as "API Layer (SSE)"
    participant A as "Agent (LangGraph)"
    participant T as "Tool Layer"
    participant E as "External APIs (NASA, WB, OWM)"

    U->>F: Select Regions & Click "Analyze"
    F->>L: POST /api/analyze (regions, dateRange)
    L->>F: 200 OK (Starts EventStream)
    
    rect rgb(240, 240, 240)
        Note over L,A: Background Streaming Lifecycle
        L->>A: Invoke Graph Workflow
        A->>L: Stream: "status" (Initializing System)
        L->>F: SSE: data: { "type": "status" }
    end

    Note over A: Reasoning Phase: "Identifying required datasets"

    loop Parallel Data Collection
        A->>T: Execute Tool (e.g., get_weather)
        T->>L: Stream: "tool_start" (Fetching...)
        L->>F: SSE: data: { "type": "tool_start" }
        
        T->>E: API Request (e.g., OpenWeatherMap)
        E-->>T: Raw JSON Data
        T-->>A: Standardized Data Payload
        
        A->>L: Stream: "tool_data" (Raw payload for UI)
        A->>L: Stream: "tool_end" (Fetch complete)
        L->>F: SSE: data: { "type": "tool_end" }
    end

    Note over A: Synthesis Phase: Pattern Recognition & Risk Calculation

    A->>L: Stream: "thinking" (Analyzing data patterns)
    L->>F: SSE: data: { "type": "thinking" }

    A->>A: Generate Structured Response (Zod Schema)
    A-->>L: Final FoodSecurityReport
    
    L->>F: SSE: data: { "type": "complete", "report": { ... } }
    
    Note over F,U: Interactive UI Update
    F->>U: Render Geospatial Pins & Risk Matrix
```

---

## 🧠 Agent Intelligence Cycle (LangGraph)

This diagram shows the internal state machine of the FoodGuard Agent. It follows a recursive **Reason-Act-Observe** pattern to ensure data completeness before generating the final report.

```mermaid
stateDiagram-v2
    state Decision <<choice>>
    [*] --> Start: User Request
    Start --> Checkpoint: Initialize Graph State
    Checkpoint --> Thinking: Analyze Context<br/>(Gemini 2.5 Flash)
    
    Thinking --> Decision
    Decision --> ToolCall: YES (Data Needed)
    Decision --> FormulateReport: NO (Data Sufficient)
    
    ToolCall --> Observation: Receive API Payload
    Observation --> Thinking: Update State Buffer
    
    FormulateReport --> Validate: Strict Zod Schema Check
    Validate --> [*]: Final JSON Output
```

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 15 (App Router, Serverless)
*   **AI Orchestration**: LangChain.js & LangGraph.js
*   **Large Language Model**: Google Gemini 2.5 Flash
*   **Styling**: Tailwind CSS (Neobrutalist Theme)
*   **Data Sources**: OpenWeatherMap, World Bank API, NASA POWER
*   **Geospatial**: Leaflet.js & React-Leaflet
*   **Validation**: Zod (Strict Schema Definition)

---

## 📊 Design Decisions

*   **Neobrutalist UI**: Chosen for its high contrast and "Information-First" aesthetic, suitable for high-stakes government and NGO monitoring.
*   **Agentic Framework**: Traditional APIs follow fixed logic; our Agentic workflow allows the AI to decide *which* tools are most relevant based on the user's specific request.
*   **SSE Streaming**: Essential for UX—since AI analysis can take 10-20 seconds, streaming provides immediate feedback and increases perceived performance.

---

## 🚧 Limitations

*   **Simulated Data**: Regional warehouse stocks and historical shortage records are currently simulated; real-world integration requires direct access to PASSCO/Gov databases.
*   **Connectivity**: System depends on the availability of 3rd party APIs (NASA/World Bank).

---

## 🔮 Future Improvements

*   **Satellite Image Processing**: Integrating Gemini Vision to analyze actual crop snapshots for pest detection.
*   **Mobile Pulse**: SMS integration to alert farmers in offline regions about predicted shortages.
*   **Predictive Logistics**: Automatically suggesting the most cost-effective truck routes between surplus and shortage regions.
