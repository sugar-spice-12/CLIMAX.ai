# Implementation Plan: Remove Google AI Dependency

## Overview

This implementation plan removes the Google AI API dependency by replacing API calls with static mock data generators. The approach extracts and enhances the existing fallback logic in geminiService.ts to become the primary implementation, maintaining all existing interfaces while eliminating external dependencies.

## Tasks

- [ ] 1. Update geminiService.ts to remove Google AI dependency
  - Remove all imports of @google/genai package
  - Remove getAI() function
  - Remove all try-catch blocks that call Google AI API
  - Promote fallback logic to be the primary implementation
  - Ensure all three functions (fetchLiveClimateData, getClimateInsights, getLocalRiskAreas) return static data
  - _Requirements: 1.1, 1.2, 1.5, 2.1-2.7, 3.1-3.5, 4.1-4.7_

- [ ] 2. Update package.json to remove Google AI dependency
  - Remove @google/genai from dependencies section
  - _Requirements: 1.4_

- [ ] 3. Update README.md documentation
  - Remove API key setup instructions (step 2)
  - Add note that application uses mock data
  - Update prerequisites if needed
  - _Requirements: 6.4, 6.5_

- [ ] 4. Remove environment variable references
  - Check and remove .env.local file if it only contains API_KEY
  - Update any configuration files that reference GEMINI_API_KEY
  - _Requirements: 1.3, 6.3_

- [ ] 5. Test the application
  - Run npm install to verify no dependency errors
  - Run npm run dev to verify application starts without API key
  - Test city switching (Singapore ↔ Hong Kong)
  - Test all dashboard views (home, map, insights, sensors, alerts)
  - Verify climate metrics display correctly
  - Verify map nodes render correctly
  - Verify insights and recommendations display
  - _Requirements: 5.3-5.7, 6.1, 6.2_

## Notes

- All tasks maintain existing function signatures and data structures
- No breaking changes to App.tsx or other components
- The existing fallback logic already provides the correct data format
- Temperature values will have small random variations to simulate live data
- Each city (Singapore/Hong Kong) has distinct base values and node sets