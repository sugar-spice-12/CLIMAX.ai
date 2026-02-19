# Design Document: Remove Google AI Dependency

## Overview

This design describes how to remove the Google AI API dependency from the CLIMAX.ai dashboard by replacing the `geminiService.ts` module with static mock data generators. The existing service has three main functions that call the Gemini API, and each has fallback logic that already provides static data when API calls fail. We will extract and enhance this fallback logic to become the primary implementation, eliminating the need for API calls entirely.

The approach preserves all existing interfaces and data structures, ensuring zero breaking changes to the Dashboard component while simplifying the development setup and removing external dependencies.

## Architecture

### Current Architecture
```
App.tsx → geminiService.ts → Google Gemini AI API
                           ↓ (on error)
                      Fallback static data
```

### New Architecture
```
App.tsx → geminiService.ts → Static data generators
```

The new architecture removes the API layer entirely and promotes the fallback logic to be the primary implementation. This maintains the same module interface while eliminating network dependencies.

## Components and Interfaces

### 1. Climate Data Generator

**Purpose:** Generate realistic climate metrics for different cities

**Function Signature:**
```typescript
export const fetchLiveClimateData = async (city: string): Promise<ClimateMetric[]>
```

**Implementation Strategy:**
- Use city-specific base values (Singapore: 31.42°C, Hong Kong: 24.85°C)
- Add random variation (±0.45°C) to simulate live data changes
- Return array of 4 metrics: Temperature, Humidity, Rainfall, AQI
- Maintain 2 decimal precision for temperature values
- Include trend and status indicators

**Data Structure:**
```typescript
interface ClimateMetric {
  label: string;      // e.g., "Temperature"
  value: string | number;  // e.g., 31.42 or "31.42"
  unit: string;       // e.g., "°C"
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}
```

### 2. Insights Generator

**Purpose:** Provide strategic urban resilience recommendations

**Function Signature:**
```typescript
export const getClimateInsights = async (
  city: string, 
  metrics: any, 
  module: DashboardModule = DashboardModule.OVERVIEW
): Promise<AIInsight>
```

**Implementation Strategy:**
- Return city-specific summary text
- Provide 3 concrete operational recommendations
- Include confidence score (0.91 for consistency)
- Use existing fallback text from current implementation

**Data Structure:**
```typescript
interface AIInsight {
  summary: string;
  recommendations: string[];
  confidence: number;
}
```

### 3. Risk Nodes Generator

**Purpose:** Generate infrastructure node locations for map visualization

**Function Signature:**
```typescript
export const getLocalRiskAreas = async (
  lat: number, 
  lng: number, 
  query: string
): Promise<{ text: string; groundingChunks: any[] }>
```

**Implementation Strategy:**
- Detect city by latitude (Singapore: lat < 5, Hong Kong: lat >= 5)
- Return 8 predefined infrastructure nodes per city
- Include node metadata: title, type, position, URI
- Generate Google Maps search links for each node
- Use _pos property for UI positioning

**Node Types:**
- Micro-grid
- Transport Hub
- Logistics
- Building
- Infrastructure
- Sensor
- Campus

## Data Models

### Singapore Climate Data
```typescript
{
  baseTemperature: 31.42,
  humidity: 81,
  rainfall: 0.12,
  aqi: 48,
  nodes: [
    { title: "Marina Bay District Cooling Hub", type: "Micro-grid", pos: [35, 45] },
    { title: "Raffles Place Transport Exchange", type: "Transport Hub", pos: [45, 42] },
    { title: "Jurong Island Grid Node 04", type: "Micro-grid", pos: [65, 20] },
    { title: "Tuas Mega Logistics Hub", type: "Logistics", pos: [70, 15] },
    { title: "Changi Business Park Micro-grid", type: "Micro-grid", pos: [40, 85] },
    { title: "Punggol Digital District Cooling", type: "Building", pos: [20, 75] },
    { title: "Kallang Basin Flood Control", type: "Infrastructure", pos: [48, 55] },
    { title: "Orchard Urban Resilience Node", type: "Sensor", pos: [42, 38] }
  ]
}
```

### Hong Kong Climate Data
```typescript
{
  baseTemperature: 24.85,
  humidity: 75,
  rainfall: 0.08,
  aqi: 52,
  nodes: [
    { title: "International Commerce Centre", type: "Building", pos: [55, 45] },
    { title: "Victoria Harbour Sensor Cluster", type: "Sensor", pos: [60, 50] },
    { title: "Kowloon Bay District Cooling", type: "Micro-grid", pos: [45, 55] },
    { title: "West Kowloon Terminal Hub", type: "Transport Hub", pos: [58, 43] },
    { title: "Lantau Grid Stabilizer", type: "Micro-grid", pos: [75, 25] },
    { title: "Tsuen Wan Resilience Node", type: "Building", pos: [35, 30] },
    { title: "Kai Tak Smart District Node", type: "Campus", pos: [42, 60] },
    { title: "Central Financial Resilience Hub", type: "Building", pos: [62, 48] }
  ]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

