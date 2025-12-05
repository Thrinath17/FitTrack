# Test Scenarios - FitTrack Pro

**Version:** 1.0  
**Last Updated:** 2024  
**Test Coverage:** Critical and High Priority Flows

---

## Table of Contents

1. [Authentication & Session Management](#1-authentication--session-management)
2. [Workout Routine Management](#2-workout-routine-management)
3. [Workout Execution](#3-workout-execution)
4. [Workout Scheduling](#4-workout-scheduling)
5. [Attendance Tracking](#5-attendance-tracking)
6. [Calendar View](#6-calendar-view)
7. [Analytics & AI Insights](#7-analytics--ai-insights)
8. [Settings & Configuration](#8-settings--configuration)
9. [Navigation & UI](#9-navigation--ui)
10. [Error Handling & Edge Cases](#10-error-handling--edge-cases)
11. [Data Persistence](#11-data-persistence)
12. [Responsive Design](#12-responsive-design)

---

## 1. Authentication & Session Management

### TC-AUTH-001: First-Time User Login with Google
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User is not logged in
- App is loaded in browser
- localStorage is empty

**Test Steps:**
1. Open application in browser
2. Verify Auth Screen is displayed
3. Click "Sign in with Google" button
4. Wait for authentication to complete (mock)

**Expected Results:**
- Auth Screen displays with Google, Apple, and Email options
- After clicking Google, user is authenticated
- User is redirected to Workouts view (default home)
- User session is saved in localStorage
- User can see empty state with "Start Workout" option

**Post-Conditions:**
- User is logged in
- User data exists in localStorage

---

### TC-AUTH-002: Login with Email/Password - Valid Email
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User is not logged in
- App is loaded

**Test Steps:**
1. Open application
2. Click "Sign in with Email" button
3. Enter valid email: `test@example.com`
4. Enter password: `password123`
5. Click "Sign In" button

**Expected Results:**
- Email input field is displayed
- Password input field is displayed
- Email format is validated (no error shown for valid email)
- User is authenticated successfully
- Redirected to Workouts view
- User name is extracted from email (before @)

---

### TC-AUTH-003: Login with Email - Invalid Email Format
**Priority:** P0 (Critical)  
**Type:** Functional, Negative

**Preconditions:**
- User is not logged in
- Email form is displayed

**Test Steps:**
1. Click "Sign in with Email"
2. Enter invalid email: `invalid-email`
3. Enter password: `password123`
4. Click "Sign In" button

**Expected Results:**
- Error message displayed: "Please enter a valid email address."
- User is NOT authenticated
- Remains on Auth Screen
- Error message is associated with email field (aria-describedby)

---

### TC-AUTH-004: Login with Email - Empty Fields
**Priority:** P0 (Critical)  
**Type:** Functional, Negative

**Test Steps:**
1. Click "Sign in with Email"
2. Leave email field empty
3. Leave password field empty
4. Click "Sign In" button

**Expected Results:**
- Error message: "Please enter both email and password."
- Form does not submit
- User remains on Auth Screen

---

### TC-AUTH-005: Session Persistence After Browser Close
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User is logged in
- User has created at least one workout routine

**Test Steps:**
1. Log in to the application
2. Create a workout routine "Test Routine"
3. Close the browser completely
4. Reopen browser and navigate to application URL

**Expected Results:**
- User is automatically logged in
- User is redirected to Workouts view (not Auth Screen)
- Previously created workout "Test Routine" is visible
- All user data is restored from localStorage

---

### TC-AUTH-006: Logout Functionality
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User is logged in
- User has some data (workouts, attendance)

**Test Steps:**
1. Navigate to Settings view
2. Click "Sign Out" button
3. Confirm logout (if confirmation dialog appears)

**Expected Results:**
- User is logged out
- Redirected to Auth Screen
- User data is cleared from localStorage (or session cleared)
- Cannot access protected views without logging in again

---

### TC-AUTH-007: Login with Apple
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Open application
2. Click "Sign in with Apple" button
3. Wait for authentication

**Expected Results:**
- Authentication completes successfully
- User is redirected to Workouts view
- User session is saved

---

## 2. Workout Routine Management

### TC-WORKOUT-001: Create New Workout Routine - Complete Flow
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User is logged in
- User is on Workouts view

**Test Steps:**
1. Click "New" button in Routines section
2. Enter workout name: "Chest Day"
3. Add first exercise: "Bench Press"
4. Add 3 sets:
   - Set 1: 225 lbs, 5 reps
   - Set 2: 225 lbs, 5 reps
   - Set 3: 225 lbs, 5 reps
5. Add second exercise: "Incline Dumbbell Press"
6. Add 2 sets:
   - Set 1: 80 lbs, 8 reps
   - Set 2: 80 lbs, 8 reps
7. Click "Save Routine" button

**Expected Results:**
- Workout Editor opens
- Workout name is saved
- Exercises are added successfully
- Sets are added with correct weight and reps
- Abbreviation auto-generates (e.g., "CD" for "Chest Day")
- Default color is applied (#F97316)
- Routine is saved to localStorage
- Returns to Workouts view
- "Chest Day" appears in routines list
- Routine shows exercise count (e.g., "2 Exercises")

---

### TC-WORKOUT-002: Create Workout - Invalid Name (Empty)
**Priority:** P0 (Critical)  
**Type:** Functional, Negative

**Test Steps:**
1. Click "New" button
2. Leave workout name empty
3. Try to click "Save Routine"

**Expected Results:**
- "Save Routine" button is disabled
- Cannot save workout without name
- Error message: "Please enter a valid workout name (1-50 characters)."

---

### TC-WORKOUT-003: Create Workout - Name Too Long
**Priority:** P1 (High)  
**Type:** Functional, Negative

**Test Steps:**
1. Click "New" button
2. Enter workout name with 51+ characters
3. Try to save

**Expected Results:**
- Input field limits to 50 characters
- Or validation error prevents saving
- Error message displayed

---

### TC-WORKOUT-004: Create Workout - Invalid Reps (Negative)
**Priority:** P0 (Critical)  
**Type:** Functional, Negative

**Test Steps:**
1. Create new workout
2. Add exercise "Test Exercise"
3. Try to enter negative reps: -5
4. Try to enter reps > 1000: 2000

**Expected Results:**
- Negative values are rejected or set to 0
- Values > 1000 are rejected or capped
- Validation prevents invalid data entry

---

### TC-WORKOUT-005: Create Workout - Invalid Weight
**Priority:** P0 (Critical)  
**Type:** Functional, Negative

**Test Steps:**
1. Create new workout
2. Add exercise
3. Try to enter weight > 2000 lbs
4. Try to enter negative weight

**Expected Results:**
- Weight > 2000 is rejected or capped
- Negative weight is rejected or set to 0
- Validation error message displayed

---

### TC-WORKOUT-006: Edit Existing Workout Routine
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one saved workout routine

**Test Steps:**
1. Navigate to Workouts view
2. Click edit icon (pencil) on an existing routine
3. Modify workout name
4. Add a new exercise
5. Modify reps/weight of existing sets
6. Click "Save Routine"

**Expected Results:**
- Workout Editor opens with existing data pre-filled
- Changes are saved successfully
- Updated routine appears in list
- Original workout ID is preserved
- All modifications are reflected

---

### TC-WORKOUT-007: Delete Workout Routine
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one saved workout routine

**Test Steps:**
1. Navigate to Workouts view
2. Click delete icon (trash) on a routine
3. Confirm deletion (if confirmation dialog)

**Expected Results:**
- Routine is removed from list
- Routine is deleted from localStorage
- Routine no longer appears in any view
- Other routines remain intact

---

### TC-WORKOUT-008: Add Exercise to Workout
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Create new workout or edit existing
2. Click "Add Exercise" button
3. Enter exercise name: "Squats"
4. Add note: "Focus on form"
5. Add 3 sets with reps and weight

**Expected Results:**
- New exercise is added
- Exercise name is saved
- Note is saved
- Sets are added successfully
- Exercise appears in workout list

---

### TC-WORKOUT-009: Remove Exercise from Workout
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- Workout has at least 2 exercises

**Test Steps:**
1. Edit workout
2. Click delete icon on an exercise
3. Save workout

**Expected Results:**
- Exercise is removed
- All sets for that exercise are removed
- Workout saves successfully
- Remaining exercises are preserved

---

### TC-WORKOUT-010: Add Set to Exercise
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Create/edit workout
2. Select an exercise
3. Click "Add Set" button
4. Enter reps and weight

**Expected Results:**
- New set is added
- Set inherits weight from previous set (if available)
- Set number increments correctly
- Set is saved with workout

---

### TC-WORKOUT-011: Remove Set from Exercise
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- Exercise has at least 2 sets

**Test Steps:**
1. Edit workout
2. Click remove (×) button on a set
3. Save workout

**Expected Results:**
- Set is removed
- Remaining sets are preserved
- Set numbers adjust correctly

---

### TC-WORKOUT-012: Workout Abbreviation Auto-Generation
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Create workout with name "Chest Day"
2. Create workout with name "Legs"
3. Create workout with name "Upper Body Push"

**Expected Results:**
- "Chest Day" → "CD" (first letter of each word)
- "Legs" → "LE" (first two letters)
- "Upper Body Push" → "UB" (first letter of first two words)
- Abbreviations are uppercase

---

## 3. Workout Execution

### TC-EXEC-001: Start Workout from Routine
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one saved workout routine

**Test Steps:**
1. Navigate to Workouts view
2. Click on a workout routine (e.g., "Chest Day")
3. Verify workout execution screen opens

**Expected Results:**
- Full-screen workout execution view opens
- All exercises from routine are displayed
- All sets are pre-filled with weight and reps
- Workout name is displayed in header
- Sets remaining counter shows correct number
- "Finish Workout" button is visible

---

### TC-EXEC-002: Start Ad-Hoc Workout (No Routine)
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Workouts view
2. Click "Start Workout" button in hero section
3. Verify execution screen opens

**Expected Results:**
- Workout execution screen opens
- Workout name field is empty (placeholder: "Chest Day")
- No exercises pre-loaded
- User can add exercises on-the-fly
- Default abbreviation "W" is shown

---

### TC-EXEC-003: Mark Set as Complete
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- Workout execution screen is open
- Workout has at least one set

**Test Steps:**
1. Click on a set's completion checkbox/circle
2. Verify set is marked complete
3. Click again to unmark

**Expected Results:**
- Set checkbox/circle turns green when checked
- Set is visually marked (strikethrough, different color)
- Sets remaining counter decreases
- Can toggle set completion on/off
- Progress updates in real-time

---

### TC-EXEC-004: Edit Exercise During Execution
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Click edit icon on an exercise
3. Modify exercise name
4. Add/modify exercise note
5. Click "Done" to save

**Expected Results:**
- Exercise name becomes editable
- Note field becomes editable
- Changes are saved
- Exercise updates in real-time
- Edit mode closes after saving

---

### TC-EXEC-005: Add Exercise During Execution
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Scroll to bottom
3. Click "Add Exercise" button
4. Enter exercise name
5. Add sets with reps and weight

**Expected Results:**
- New exercise is added to workout
- Exercise appears in list
- Can add sets to new exercise
- Exercise is included when finishing workout

---

### TC-EXEC-006: Add Set During Execution
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Select an exercise
3. Click "Add Set" button
4. Enter reps and weight

**Expected Results:**
- New set is added to exercise
- Set number increments correctly
- Weight inherits from previous set (if available)
- Set can be marked complete

---

### TC-EXEC-007: Update Reps/Weight During Execution
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Click on reps field for a set
3. Change reps value
4. Click on weight field
5. Change weight value

**Expected Results:**
- Values can be edited inline
- Changes are saved immediately
- No need to click save
- Values persist when toggling set completion

---

### TC-EXEC-008: Finish Workout - Save to History
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- Workout execution is in progress
- At least one set is marked complete

**Test Steps:**
1. Complete some sets
2. Click "Finish Workout" button
3. In modal, click "No, thanks" (don't save as routine)
4. Verify workout is saved

**Expected Results:**
- "Workout Completed!" modal appears
- Option to save as routine is shown
- After clicking "No, thanks", workout is saved to today's attendance
- Returns to Workouts view
- Workout appears in Recent Activity
- Workout appears in Calendar for today

---

### TC-EXEC-009: Finish Workout - Save as Routine
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Complete a workout
2. Click "Finish Workout"
3. Click "Save as Routine" in modal
4. Verify routine is created

**Expected Results:**
- Workout is saved to today's attendance
- Workout is also saved as a new routine
- Routine appears in Routines list
- Can be used for future workouts

---

### TC-EXEC-010: Cancel Workout Execution
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Click cancel/delete button (trash icon)
3. Confirm cancellation in dialog

**Expected Results:**
- Confirmation dialog: "Are you sure you want to cancel this workout? Progress will be lost."
- On confirm, workout is cancelled
- Returns to Workouts view
- No workout is saved
- Progress is lost

---

### TC-EXEC-011: Minimize Workout Execution
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Click minimize/back arrow button
3. Verify workout state is preserved

**Expected Results:**
- Returns to Workouts view
- Workout execution state is preserved
- "Resume" button appears in hero section
- Can resume workout later
- Progress is maintained

---

### TC-EXEC-012: Resume Minimized Workout
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- Workout was minimized (not finished)

**Test Steps:**
1. Navigate to Workouts view
2. Click "Resume" button in hero section
3. Verify workout state is restored

**Expected Results:**
- Workout execution screen opens
- All exercises and sets are restored
- Completed sets remain checked
- Can continue from where left off

---

### TC-EXEC-013: Motivational Messages During Execution
**Priority:** P2 (Medium)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout with multiple exercises
2. Complete sets progressively
3. Observe motivational messages

**Expected Results:**
- "Keep Pushing!" appears mid-workout
- "Finish Strong!" appears on last exercise
- "All Done!" appears when all sets complete
- Messages update based on progress
- Sets remaining counter updates

---

### TC-EXEC-014: Edit Workout Name During Execution
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Start ad-hoc workout
2. Click on workout name in header
3. Edit name to "My Custom Workout"
4. Verify name updates

**Expected Results:**
- Workout name field is editable
- Abbreviation updates automatically
- Name is saved when finishing workout

---

## 4. Workout Scheduling

### TC-SCHED-001: Schedule Workout for Future Date
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one saved workout routine

**Test Steps:**
1. Navigate to Workouts view
2. Click "Schedule" tab
3. Click "Schedule" button
4. Select a future date (e.g., next Tuesday)
5. Click "Next"
6. Select a workout routine (e.g., "Chest Day")
7. Verify workout is scheduled

**Expected Results:**
- Date picker modal opens
- Can select any future date
- Template selection screen shows available routines
- Workout is scheduled for selected date
- Returns to Schedule tab
- Scheduled workout appears in "Upcoming Schedule" list
- Shows date and workout name

---

### TC-SCHED-002: Schedule Custom Workout (Not from Template)
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Schedule tab
2. Click "Schedule" button
3. Select future date
4. Click "Next"
5. Click "Create Custom" button
6. Create new workout in editor
7. Save workout

**Expected Results:**
- Workout Editor opens
- Can create custom workout
- Workout is scheduled for selected date
- Custom workout appears in schedule

---

### TC-SCHED-003: View Scheduled Workouts
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one scheduled workout

**Test Steps:**
1. Navigate to Schedule tab
2. Verify scheduled workouts are displayed

**Expected Results:**
- All upcoming scheduled workouts are listed
- Shows date (formatted: "Tuesday, Jan 15")
- Shows workout name
- Shows exercise and set counts
- Today's scheduled workouts are highlighted
- Past scheduled workouts are filtered out

---

### TC-SCHED-004: Start Scheduled Workout on Scheduled Date
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has a workout scheduled for today

**Test Steps:**
1. Navigate to Workouts view on scheduled date
2. Verify hero section shows scheduled workout
3. Click "GO" button
4. Complete workout
5. Finish workout

**Expected Results:**
- Hero section shows: "It's Go Time! You have [Workout Name] planned today"
- "GO" button is visible with pulsing animation
- Clicking "GO" starts workout execution
- Workout is pre-filled with scheduled routine
- After completion, scheduled workout is marked as completed
- Scheduled workout no longer appears in upcoming list

---

### TC-SCHED-005: Delete Scheduled Workout
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one scheduled workout

**Test Steps:**
1. Navigate to Schedule tab
2. Click delete icon (trash) on a scheduled workout
3. Verify workout is removed

**Expected Results:**
- Scheduled workout is deleted
- Workout is removed from schedule
- Workout is removed from calendar view
- Other scheduled workouts remain

---

### TC-SCHED-006: Multiple Workouts Scheduled for Same Date
**Priority:** P2 (Medium)  
**Type:** Functional, Positive

**Test Steps:**
1. Schedule "Chest Day" for next Tuesday
2. Schedule "Cardio" for the same Tuesday
3. Verify both appear

**Expected Results:**
- Both workouts are scheduled
- Both appear in Schedule tab for that date
- Both appear in Calendar view for that date
- Can start either workout independently

---

### TC-SCHED-007: Schedule Workout for Today
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Schedule a workout for today's date
2. Verify it appears in hero section
3. Verify "Start Now" button is available

**Expected Results:**
- Workout is scheduled for today
- Appears in Schedule tab with "TODAY" badge
- Hero section shows scheduled workout
- Can start immediately

---

## 5. Attendance Tracking

### TC-ATTEND-001: Toggle Attendance for Today
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar view
2. Click on today's date
3. Toggle attendance switch to "Attended"
4. Verify date turns green

**Expected Results:**
- Date detail modal opens
- Attendance toggle is visible
- Toggling to "Attended" saves immediately
- Date cell turns green in calendar
- Date is saved to localStorage

---

### TC-ATTEND-002: Mark Date as Missed
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar
2. Click on a date
3. Toggle attendance to "Attended" first
4. Then toggle to "Not Attended" (Missed)

**Expected Results:**
- Date turns red (missed)
- Attendance record is updated
- Change is saved immediately

---

### TC-ATTEND-003: Add Workout to Past Date (Retroactive Logging)
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least one saved workout routine

**Test Steps:**
1. Navigate to Calendar
2. Click on a past date (e.g., yesterday)
3. Click "Add Log" button
4. Select a workout routine
5. Verify workout is added

**Expected Results:**
- Date detail modal opens
- "Add Log" button is visible
- Workout selection list appears
- Selected workout is added to that date
- Date automatically marked as "Attended"
- Workout badge appears on date in calendar

---

### TC-ATTEND-004: View Workout History for Date
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Preconditions:**
- User has performed workouts on at least one date

**Test Steps:**
1. Navigate to Calendar
2. Click on a date with workouts
3. Click on a workout in "Performed Workouts" section
4. Verify workout details are displayed

**Expected Results:**
- Workout details view opens
- Shows all exercises
- Shows all sets with reps and weights
- Shows workout notes
- Read-only view
- Can navigate back to date view

---

### TC-ATTEND-005: Remove Workout from Date
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- Date has at least one performed workout

**Test Steps:**
1. Navigate to Calendar
2. Click on date with workouts
3. Click delete icon on a performed workout
4. Verify workout is removed

**Expected Results:**
- Workout is removed from date
- Workout badge disappears from calendar
- Date may remain "Attended" if other workouts exist
- Change is saved immediately

---

### TC-ATTEND-006: Add Multiple Workouts to Same Date
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar
2. Click on a date
3. Add first workout: "Chest Day"
4. Add second workout: "Cardio"
5. Verify both appear

**Expected Results:**
- Both workouts are added to date
- Both appear in "Performed Workouts" list
- Both workout badges appear on calendar date
- Can view details of each independently

---

## 6. Calendar View

### TC-CAL-001: Navigate Calendar - Previous Month
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar view
2. Click previous month arrow (left)
3. Verify month changes

**Expected Results:**
- Calendar displays previous month
- Month name updates in header
- Dates are correct for that month
- Attendance records for that month are displayed

---

### TC-CAL-002: Navigate Calendar - Next Month
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar view
2. Click next month arrow (right)
3. Verify month changes

**Expected Results:**
- Calendar displays next month
- Month name updates
- Can navigate forward through months

---

### TC-CAL-003: Calendar Visual Indicators
**Priority:** P0 (Critical)  
**Type:** Functional, Visual

**Preconditions:**
- User has attendance records and workouts

**Test Steps:**
1. Navigate to Calendar
2. Observe different date states

**Expected Results:**
- Green dates: Attended
- Red dates: Missed (recorded but didn't attend)
- White dates: No record
- Workout badges: Colored circles with abbreviations
- Today's date: Has ring indicator
- In-progress workout: Pulsing green ring

---

### TC-CAL-004: Calendar Month Statistics
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar
2. Verify month statistics display

**Expected Results:**
- "This Month" section shows session count
- Count is accurate for current month
- Updates when attendance is changed
- Only counts "Attended" dates

---

### TC-CAL-005: Calendar Date Click - Open Modal
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Calendar
2. Click on any date
3. Verify modal opens

**Expected Results:**
- Date detail modal opens
- Shows date in header (e.g., "Mon, Jan 15")
- Shows attendance toggle
- Shows planned workouts (if any)
- Shows performed workouts (if any)
- Can close modal with X button

---

### TC-CAL-006: Calendar - Planned vs Performed Workouts
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has a planned workout for a date
- User has a performed workout with same name

**Test Steps:**
1. Schedule "Chest Day" for a date
2. Complete "Chest Day" on that date
3. View calendar for that date

**Expected Results:**
- Planned workout shows as dotted border badge
- Performed workout shows as solid badge
- After completion, planned workout is hidden (replaced by performed)
- Only one badge shows (performed takes priority)

---

## 7. Analytics & AI Insights

### TC-ANALYTICS-001: View Analytics Dashboard
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has some attendance records

**Test Steps:**
1. Navigate to Analytics view
2. Verify dashboard displays

**Expected Results:**
- "Last 7 Days" stat card shows count
- "Total Sessions" stat card shows all-time count
- Weekly frequency chart displays
- Chart shows current week (Mon-Sun)
- Bars are colored (blue for attended, gray for not)

---

### TC-ANALYTICS-002: Weekly Frequency Chart Accuracy
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has attendance records for current week

**Test Steps:**
1. Navigate to Analytics
2. Verify chart data matches attendance records
3. Check each day of week

**Expected Results:**
- Chart shows 7 days (Mon-Sun)
- Bars match actual attendance
- Attended days show blue bars
- Non-attended days show gray bars
- Tooltip shows date when hovering

---

### TC-ANALYTICS-003: Get AI Coaching Insight - Success
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Preconditions:**
- User has at least 1 attendance record
- Gemini API key is configured

**Test Steps:**
1. Navigate to Analytics
2. Click "Analyze My Consistency" button
3. Wait for AI analysis
4. Verify insight is displayed

**Expected Results:**
- Button shows "Analyzing..." during load
- Loading state is visible
- AI insight appears after analysis
- Insight contains 2-sentence summary
- Insight contains 1 actionable tip
- Tone is encouraging but firm
- Can close insight with "Close" button

---

### TC-ANALYTICS-004: Get AI Insight - No Data
**Priority:** P1 (High)  
**Type:** Functional, Edge Case

**Preconditions:**
- User has no attendance records

**Test Steps:**
1. Navigate to Analytics (new user)
2. Click "Analyze My Consistency"

**Expected Results:**
- Message: "Start logging your workouts to get personalized insights!"
- Or analysis button is disabled
- Helpful message guides user

---

### TC-ANALYTICS-005: Get AI Insight - API Error
**Priority:** P1 (High)  
**Type:** Functional, Error Handling

**Preconditions:**
- API key is invalid or network error occurs

**Test Steps:**
1. Navigate to Analytics
2. Click "Analyze My Consistency"
3. Simulate API error

**Expected Results:**
- Error is handled gracefully
- Fallback message is displayed
- User-friendly error message
- App doesn't crash
- Can retry analysis

---

### TC-ANALYTICS-006: AI Insight - Timeout Handling
**Priority:** P2 (Medium)  
**Type:** Functional, Error Handling

**Test Steps:**
1. Navigate to Analytics
2. Click "Analyze My Consistency"
3. Simulate timeout (30+ seconds)

**Expected Results:**
- Request times out after 30 seconds
- Timeout error is handled
- Fallback message is shown
- User can retry

---

### TC-ANALYTICS-007: Analytics Stats Update in Real-Time
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Analytics
2. Note current "Last 7 Days" count
3. Navigate to Calendar
4. Mark a new date as attended
5. Return to Analytics

**Expected Results:**
- Stats update to reflect new attendance
- "Last 7 Days" count increases if within range
- "Total Sessions" count increases
- Chart updates if date is in current week

---

## 8. Settings & Configuration

### TC-SETTINGS-001: Enable Push Notifications
**Priority:** P2 (Medium)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Settings
2. Toggle "Push Notifications" to ON
3. Verify browser permission request
4. Click "Save Changes"

**Expected Results:**
- Toggle switches to ON
- Browser notification permission dialog appears
- Settings are saved
- "Save Changes" button appears when changes are made
- Settings persist after page reload

---

### TC-SETTINGS-002: Set Usual Gym Time
**Priority:** P2 (Medium)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Settings
2. Enable notifications (if not enabled)
3. Change "Usual Gym Time" to "19:00"
4. Click "Save Changes"

**Expected Results:**
- Time picker is enabled when notifications are ON
- Can select time in 24-hour format
- Time is saved
- Time persists after reload

---

### TC-SETTINGS-003: Disable Notifications
**Priority:** P2 (Medium)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Settings
2. Toggle notifications to OFF
3. Save changes

**Expected Results:**
- Toggle switches to OFF
- Time picker becomes disabled (grayed out)
- Settings are saved
- Notifications are disabled

---

### TC-SETTINGS-004: Settings - Unsaved Changes Indicator
**Priority:** P2 (Medium)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Settings
2. Make a change (toggle or time)
3. Verify "Save Changes" button appears
4. Don't save, navigate away
5. Return to Settings

**Expected Results:**
- "Save Changes" button appears when changes are made
- Button animates in (slide up)
- Changes are not saved until button is clicked
- Returning to Settings shows original values

---

### TC-SETTINGS-005: Sign Out from Settings
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Navigate to Settings
2. Click "Sign Out" button
3. Verify logout

**Expected Results:**
- User is logged out
- Redirected to Auth Screen
- Cannot access protected views
- Session is cleared

---

## 9. Navigation & UI

### TC-NAV-001: Navigate Between Views - Desktop
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Open app on desktop (>1024px)
2. Click each navigation item:
   - Workouts
   - Calendar
   - Analytics
   - Settings

**Expected Results:**
- Sidebar navigation is visible
- Each click navigates to correct view
- Active view is highlighted (indigo background)
- Smooth transitions between views
- Content updates correctly

---

### TC-NAV-002: Navigate Between Views - Mobile
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Open app on mobile (<640px)
2. Click each bottom tab:
   - Workouts
   - Calendar
   - Analytics
   - Settings

**Expected Results:**
- Bottom navigation bar is visible
- Icons and labels are displayed
- Active tab is highlighted (indigo color)
- Navigation works correctly
- Content is scrollable

---

### TC-NAV-003: Default View After Login
**Priority:** P0 (Critical)  
**Type:** Functional, Positive

**Test Steps:**
1. Log in to application
2. Verify default view

**Expected Results:**
- User is redirected to Workouts view
- Workouts is the default/home view
- Not redirected to Auth, Calendar, or other views

---

### TC-NAV-004: Back Navigation from Workout Execution
**Priority:** P1 (High)  
**Type:** Functional, Positive

**Test Steps:**
1. Start workout execution
2. Click back/minimize button
3. Verify navigation

**Expected Results:**
- Returns to Workouts view
- Workout state is preserved
- Can resume workout

---

### TC-UI-001: Responsive Design - Mobile
**Priority:** P0 (Critical)  
**Type:** Visual, Responsive

**Test Steps:**
1. Open app on mobile device/browser (<640px)
2. Navigate through all views
3. Verify layout

**Expected Results:**
- Bottom navigation is visible
- Content is full-width
- Text is readable
- Buttons are touch-friendly (min 44x44px)
- No horizontal scrolling
- Safe area is respected (notch handling)

---

### TC-UI-002: Responsive Design - Desktop
**Priority:** P0 (Critical)  
**Type:** Visual, Responsive

**Test Steps:**
1. Open app on desktop (>1024px)
2. Navigate through all views
3. Verify layout

**Expected Results:**
- Sidebar navigation is visible
- Content has max-width (768px)
- Layout is centered
- Proper spacing and padding

---

### TC-UI-003: Loading States
**Priority:** P1 (High)  
**Type:** Functional, Visual

**Test Steps:**
1. Navigate to Analytics
2. Click "Analyze My Consistency"
3. Observe loading state

**Expected Results:**
- Button shows "Analyzing..." text
- Button is disabled during load
- Loading indicator is visible
- User cannot click multiple times

---

### TC-UI-004: Empty States
**Priority:** P1 (High)  
**Type:** Visual, Functional

**Test Steps:**
1. Log in as new user
2. Navigate to Workouts (no routines)
3. Navigate to Schedule (no scheduled workouts)
4. Navigate to Calendar (no attendance)

**Expected Results:**
- Workouts: "No saved routines yet" message
- Schedule: "Nothing Scheduled" with call-to-action
- Calendar: Empty calendar with helpful message
- Empty states guide user to action

---

### TC-UI-005: Error Messages Display
**Priority:** P0 (Critical)  
**Type:** Functional, Error Handling

**Test Steps:**
1. Try to save workout with empty name
2. Try to login with invalid email
3. Verify error messages

**Expected Results:**
- Error messages are user-friendly
- Messages are clear and actionable
- Errors are displayed near relevant fields
- Errors don't break UI

---

## 10. Error Handling & Edge Cases

### TC-ERROR-001: localStorage Quota Exceeded
**Priority:** P0 (Critical)  
**Type:** Error Handling

**Test Steps:**
1. Fill localStorage to capacity
2. Try to save a new workout
3. Verify error handling

**Expected Results:**
- Error is caught gracefully
- User-friendly error message: "Storage limit reached. Please clear some data or use a different browser."
- App doesn't crash
- Can continue using app (read-only)

---

### TC-ERROR-002: localStorage Unavailable
**Priority:** P0 (Critical)  
**Type:** Error Handling

**Test Steps:**
1. Disable localStorage (private browsing mode)
2. Try to use app
3. Verify error handling

**Expected Results:**
- Error is caught
- Message: "LocalStorage is not available. Please check your browser settings."
- App handles gracefully
- User is informed of issue

---

### TC-ERROR-003: Invalid JSON in localStorage
**Priority:** P1 (High)  
**Type:** Error Handling

**Test Steps:**
1. Manually corrupt localStorage data
2. Reload app
3. Verify recovery

**Expected Results:**
- App doesn't crash
- Corrupted data is handled
- Default values are used
- User can continue using app

---

### TC-ERROR-004: Network Error - AI API
**Priority:** P1 (High)  
**Type:** Error Handling

**Test Steps:**
1. Disconnect network
2. Navigate to Analytics
3. Click "Analyze My Consistency"

**Expected Results:**
- Network error is caught
- Fallback message is shown
- Error message: "Network error. Please check your connection and try again."
- App doesn't crash

---

### TC-ERROR-005: API Key Missing
**Priority:** P1 (High)  
**Type:** Error Handling

**Test Steps:**
1. Remove API key from .env.local
2. Navigate to Analytics
3. Click "Analyze My Consistency"

**Expected Results:**
- Message: "AI Coach is unavailable. Please check your API Key configuration."
- Button may be disabled or show message
- App continues to work for other features

---

### TC-ERROR-006: React Error Boundary
**Priority:** P0 (Critical)  
**Type:** Error Handling

**Test Steps:**
1. Simulate a React component error
2. Verify error boundary catches it

**Expected Results:**
- Error boundary displays error UI
- User sees: "Something went wrong"
- Error details are shown (in development)
- "Try Again" and "Refresh Page" buttons work
- App doesn't completely crash

---

### TC-EDGE-001: Very Long Workout Name
**Priority:** P1 (High)  
**Type:** Edge Case

**Test Steps:**
1. Try to create workout with 50-character name
2. Try to create workout with 51+ characters

**Expected Results:**
- 50 characters is accepted
- 51+ characters is rejected or truncated
- Validation error is shown

---

### TC-EDGE-002: Zero Reps/Weight
**Priority:** P1 (High)  
**Type:** Edge Case

**Test Steps:**
1. Create workout
2. Add set with 0 reps
3. Add set with 0 weight

**Expected Results:**
- Zero values are accepted (valid for bodyweight exercises)
- Workout can be saved
- Zero values display correctly

---

### TC-EDGE-003: Maximum Values (Reps/Weight)
**Priority:** P2 (Medium)  
**Type:** Edge Case

**Test Steps:**
1. Try to enter reps > 1000
2. Try to enter weight > 2000 lbs

**Expected Results:**
- Values are rejected or capped at maximum
- Validation error is shown
- Maximum values (1000 reps, 2000 lbs) are accepted

---

### TC-EDGE-004: Multiple Workouts Same Name
**Priority:** P2 (Medium)  
**Type:** Edge Case

**Test Steps:**
1. Create workout "Test"
2. Create another workout "Test"
3. Verify both are saved

**Expected Results:**
- Both workouts are saved (unique IDs)
- Both appear in list
- Can distinguish between them

---

### TC-EDGE-005: Workout with No Exercises
**Priority:** P2 (Medium)  
**Type:** Edge Case

**Test Steps:**
1. Create workout with name only
2. Don't add any exercises
3. Try to save

**Expected Results:**
- Workout can be saved (empty exercises array)
- Workout appears in list
- Can add exercises later when editing

---

### TC-EDGE-006: Exercise with No Sets
**Priority:** P2 (Medium)  
**Type:** Edge Case

**Test Steps:**
1. Create workout
2. Add exercise
3. Remove all sets
4. Save workout

**Expected Results:**
- Workout can be saved
- Exercise with no sets is valid
- Can add sets later

---

## 11. Data Persistence

### TC-DATA-001: Data Persists After Page Reload
**Priority:** P0 (Critical)  
**Type:** Data Persistence

**Preconditions:**
- User has created workouts and logged attendance

**Test Steps:**
1. Create a workout routine
2. Log attendance for today
3. Reload page (F5 or Cmd+R)
4. Verify data is still present

**Expected Results:**
- All workouts are still present
- Attendance records are preserved
- Settings are maintained
- User session persists

---

### TC-DATA-002: Data Persists After Browser Close
**Priority:** P0 (Critical)  
**Type:** Data Persistence

**Test Steps:**
1. Create workout and log attendance
2. Close browser completely
3. Reopen browser and navigate to app
4. Verify data exists

**Expected Results:**
- All data is restored
- User is still logged in
- Workouts, attendance, settings all present

---

### TC-DATA-003: Workout Execution State Persists
**Priority:** P1 (High)  
**Type:** Data Persistence

**Test Steps:**
1. Start workout execution
2. Complete some sets
3. Close browser
4. Reopen and navigate to app

**Expected Results:**
- Workout execution state may be lost (expected)
- Or workout state is preserved (if implemented)
- User can resume or start fresh

---

### TC-DATA-004: Concurrent Data Updates
**Priority:** P2 (Medium)  
**Type:** Data Persistence

**Test Steps:**
1. Open app in two browser tabs
2. Create workout in Tab 1
3. Check Tab 2

**Expected Results:**
- Tab 2 may not show new workout (localStorage not synced across tabs)
- Or data syncs (if storage events are implemented)
- No data corruption occurs

---

## 12. Responsive Design

### TC-RESP-001: Mobile Viewport (< 640px)
**Priority:** P0 (Critical)  
**Type:** Responsive

**Test Steps:**
1. Open app in mobile viewport (375px width)
2. Navigate through all views
3. Test all interactions

**Expected Results:**
- Bottom navigation is visible
- Content is readable
- Buttons are touch-friendly
- No horizontal scroll
- Text doesn't overflow
- Modals are full-width or properly sized

---

### TC-RESP-002: Tablet Viewport (640px - 1024px)
**Priority:** P1 (High)  
**Type:** Responsive

**Test Steps:**
1. Open app in tablet viewport (768px)
2. Verify layout

**Expected Results:**
- Layout adapts appropriately
- Navigation works (may be bottom or sidebar)
- Content is properly sized
- No layout breaks

---

### TC-RESP-003: Desktop Viewport (> 1024px)
**Priority:** P0 (Critical)  
**Type:** Responsive

**Test Steps:**
1. Open app in desktop viewport (1920px)
2. Verify layout

**Expected Results:**
- Sidebar navigation is visible
- Content has max-width and is centered
- Proper spacing
- No stretched content

---

### TC-RESP-004: Orientation Change (Mobile)
**Priority:** P2 (Medium)  
**Type:** Responsive

**Test Steps:**
1. Open app on mobile in portrait
2. Rotate to landscape
3. Verify layout adapts

**Expected Results:**
- Layout adapts to orientation
- No layout breaks
- Navigation remains accessible
- Content is readable

---

## Test Execution Summary

### Priority Distribution
- **P0 (Critical)**: 45 test cases
- **P1 (High)**: 35 test cases
- **P2 (Medium)**: 15 test cases

### Total Test Cases: 95

### Test Categories
- **Functional Tests**: 70
- **Error Handling**: 6
- **Edge Cases**: 6
- **Data Persistence**: 4
- **Responsive Design**: 4
- **Visual/UI**: 5

---

## Test Execution Guidelines

### Pre-Test Setup
1. Clear browser localStorage
2. Ensure API key is configured (for AI tests)
3. Use fresh browser session
4. Clear browser cache if needed

### Test Data Requirements
- Create test workouts: "Chest Day", "Leg Day", "Cardio"
- Create attendance records for various dates
- Test with empty state (new user)
- Test with populated data (existing user)

### Browser Testing
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Test Environment
- Development server: `http://localhost:3000`
- Test API key: Configured in `.env.local`
- Test data: Use localStorage (cleared between test runs)

---

## Automation Recommendations

### High Priority for Automation
- TC-AUTH-001, TC-AUTH-002: Authentication flows
- TC-WORKOUT-001, TC-WORKOUT-006: Workout CRUD operations
- TC-EXEC-001, TC-EXEC-008: Workout execution flows
- TC-ATTEND-001, TC-ATTEND-003: Attendance tracking
- TC-DATA-001, TC-DATA-002: Data persistence

### Manual Testing Required
- TC-UI-001, TC-UI-002: Responsive design (visual)
- TC-RESP-001 to TC-RESP-004: Viewport testing
- TC-ANALYTICS-003: AI insights (requires API)
- TC-ERROR-001, TC-ERROR-002: Error scenarios

---

## Test Reporting

### Test Results Template
```
Test Case ID: TC-XXX-XXX
Status: PASS / FAIL / BLOCKED
Priority: P0 / P1 / P2
Browser: Chrome 120
Date: YYYY-MM-DD
Tester: [Name]
Notes: [Any observations]
Screenshots: [If applicable]
```

### Defect Reporting
- Link failed test cases to defects
- Include steps to reproduce
- Include expected vs actual results
- Include screenshots/videos
- Assign priority based on test case priority

---

*This test scenarios document should be updated as new features are added or existing features are modified.*

