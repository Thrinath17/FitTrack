# FitTrack — Claude Code Guide

React fitness tracking PWA with Firebase backend and Capacitor iOS deployment.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run test         # Run tests in watch mode (vitest)
npm run test:run     # Run tests once
npm run test:ui      # Open Vitest UI
npm run test:coverage

# Firebase
npm run firebase:serve       # Start Firebase emulators
npm run firebase:deploy      # Deploy everything
npm run firebase:deploy:functions
npm run firebase:deploy:hosting

# Run a single test file
npx vitest run src/features/workouts/WorkoutEditor.test.tsx
```

## Architecture

**State management:** All app state lives in `src/App.tsx` and is passed down as props. No global state library — `WorkoutExecutionContext` (in `src/contexts/`) is the only React context, used for active workout session state.

**Storage:** `src/services/storageService.ts` wraps `localStorage` for persistence. Firebase is wired up (`src/firebase-config.ts`) but the app currently uses local storage as the primary data layer; Firebase is used for auth and backend Functions.

**Feature structure:** Each feature lives in `src/features/<name>/` with a `<Name>View.tsx` as the entry point:
- `auth/` — Login screen (email, Google, Apple — currently mocked)
- `workouts/` — Workout list and editor
- `calendar/` — Attendance/calendar view
- `analytics/` — Dashboard with charts (recharts)
- `settings/` — User settings

**AI integration:** `src/services/geminiService.ts` calls Gemini via `@google/genai`. The API key is managed server-side via Firebase Functions (`functions/src/`), not exposed in the frontend build.

**Mobile:** Capacitor wraps the Vite app for iOS. `capacitor.config.ts` configures the native layer. iOS project is in `ios/`.

**Test setup:** Vitest + jsdom + `@testing-library/react`. Setup file at `src/test/setup.ts`. Test files are co-located with their source files. Integration tests live in `src/__tests__/`. Path alias `@` maps to `src/`.

**Type definitions:** All shared types (User, Workout, Exercise, AttendanceRecord, etc.) are in `src/types.ts`.
