# Requirements Document

## Introduction

This specification defines the requirements for removing the Google AI API dependency from the CLIMAX.ai urban climate intelligence dashboard. The system currently relies on Google's Gemini AI for generating climate insights, fetching live climate data, and identifying local risk areas. The goal is to replace these AI-powered features with static mock data and deterministic logic that maintains the visual and functional experience of the application without requiring external API calls.

## Glossary

- **Dashboard**: The main CLIMAX.ai user interface displaying climate metrics and urban intelligence
- **Gemini_Service**: The module (geminiService.ts) that interfaces with Google's Gemini AI API
- **Climate_Metrics**: Temperature, humidity, rainfall, and AQI data displayed in the dashboard
- **AI_Insights**: Strategic recommendations and analysis summaries generated for urban resilience
- **Risk_Nodes**: Geographic points representing infrastructure locations (grids, buildings, hubs)
- **Mock_Data**: Predefined static data that simulates API responses
- **Fallback_Logic**: The existing error handling code that provides static data when API calls fail

## Requirements

### Requirement 1: Remove Google AI API Dependency

**User Story:** As a developer, I want to remove the Google AI API dependency, so that the application can run without requiring API keys or external service calls.

#### Acceptance Criteria

1. THE System SHALL remove all imports of @google/genai package from the codebase
2. THE System SHALL remove the getAI() function that initializes the Google AI client
3. THE System SHALL remove all environment variable references to API_KEY
4. THE System SHALL remove @google/genai from package.json dependencies
5. THE System SHALL ensure no code attempts to make network calls to Google AI services

### Requirement 2: Provide Static Climate Data

**User Story:** As a user, I want to see realistic climate metrics, so that I can evaluate the dashboard's visual design and functionality.

#### Acceptance Criteria

1. WHEN fetchLiveClimateData is called with a city parameter, THE System SHALL return an array of ClimateMetric objects
2. THE System SHALL provide different base values for Singapore (31.42°C) and Hong Kong (24.85°C)
3. THE System SHALL add small random variations (±0.45) to temperature values to simulate live data
4. THE System SHALL return metrics for Temperature, Humidity, Rainfall, and AQI Index
5. THE System SHALL format temperature values with exactly 2 decimal places
6. THE System SHALL include trend indicators ('up', 'down', 'stable') for each metric
7. THE System SHALL include status indicators ('normal', 'warning', 'critical') for each metric

### Requirement 3: Generate Static Urban Insights

**User Story:** As a user, I want to see strategic recommendations and analysis, so that I can understand the dashboard's intelligence features.

#### Acceptance Criteria

1. WHEN getClimateInsights is called, THE System SHALL return an AIInsight object
2. THE System SHALL provide city-specific summary text for Singapore and Hong Kong
3. THE System SHALL return exactly 3 operational recommendations
4. THE System SHALL include a confidence score between 0 and 1
5. THE System SHALL return consistent insights for the same city to maintain predictable behavior

### Requirement 4: Provide Static Risk Node Data

**User Story:** As a user, I want to see infrastructure nodes on the map view, so that I can visualize urban risk areas.

#### Acceptance Criteria

1. WHEN getLocalRiskAreas is called with coordinates, THE System SHALL return a response object with groundingChunks array
2. THE System SHALL provide 8 infrastructure nodes for each city
3. THE System SHALL include node properties: title, type, position coordinates, and URI
4. THE System SHALL provide different node sets for Singapore (lat < 5) and Hong Kong (lat >= 5)
5. THE System SHALL include diverse node types: Micro-grid, Transport Hub, Logistics, Building, Infrastructure, Sensor, Campus
6. THE System SHALL generate Google Maps search URIs for each node based on the node title
7. THE System SHALL position nodes at different screen coordinates using the _pos property

### Requirement 5: Maintain Existing Functionality

**User Story:** As a user, I want the dashboard to work exactly as before, so that I experience no disruption in functionality.

#### Acceptance Criteria

1. THE System SHALL maintain all existing function signatures (parameters and return types)
2. THE System SHALL preserve the ClimateMetric, AIInsight, and risk node data structures
3. THE System SHALL ensure the Dashboard component continues to render without errors
4. THE System SHALL maintain the loading states and UI transitions
5. THE System SHALL preserve the city-switching functionality
6. THE System SHALL maintain the map layer visualization features
7. THE System SHALL keep all existing UI components functional (home, map, insights, sensors, alerts views)

### Requirement 6: Simplify Development Setup

**User Story:** As a developer, I want to run the application without configuration, so that I can quickly start development.

#### Acceptance Criteria

1. THE System SHALL allow npm install to complete without requiring API keys
2. THE System SHALL allow npm run dev to start the application without environment variables
3. THE System SHALL remove the requirement to set GEMINI_API_KEY in .env.local
4. THE System SHALL update README.md to remove API key setup instructions
5. THE System SHALL document that the application now uses mock data
