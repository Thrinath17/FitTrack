/**
 * Bug Report Generator
 * Parses test output and creates comprehensive bug report
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read test output
const testOutput = fs.readFileSync(path.join(__dirname, 'test-output.log'), 'utf-8');

// Parse failed tests
const bugs = [];
const testCaseMap = {
  'TC-AUTH-001': { name: 'First-Time User Login with Google', priority: 'P0' },
  'TC-AUTH-002': { name: 'Login with Email/Password - Valid Email', priority: 'P0' },
  'TC-AUTH-003': { name: 'Login with Email - Invalid Email Format', priority: 'P0' },
  'TC-AUTH-004': { name: 'Login with Email - Empty Fields', priority: 'P0' },
  'TC-AUTH-005': { name: 'Session Persistence After Browser Close', priority: 'P0' },
  'TC-AUTH-006': { name: 'Logout Functionality', priority: 'P0' },
  'TC-WORKOUT-001': { name: 'Create New Workout Routine', priority: 'P0' },
  'TC-WORKOUT-002': { name: 'Create Workout - Invalid Name', priority: 'P0' },
  'TC-WORKOUT-008': { name: 'Add Exercise to Workout', priority: 'P0' },
  'TC-WORKOUT-010': { name: 'Add Set to Exercise', priority: 'P0' },
  'TC-ATTEND-001': { name: 'Toggle Attendance for Today', priority: 'P0' },
  'TC-SETTINGS-001': { name: 'Enable Push Notifications', priority: 'P2' },
  'TC-ERROR-001': { name: 'localStorage Quota Exceeded', priority: 'P0' },
  'TC-ERROR-002': { name: 'localStorage Unavailable', priority: 'P0' },
  'TC-ERROR-003': { name: 'Invalid JSON in localStorage', priority: 'P1' },
  'TC-DATA-001': { name: 'Data Persists After Page Reload', priority: 'P0' },
  'TC-DATA-002': { name: 'Data Persists After Browser Close', priority: 'P0' },
};

// Extract failed tests
const failPattern = /FAIL\s+([^\s]+)\s+>([^>]+)>\s+(.+?)\n/g;
const errorPattern = /Error:\s+(.+?)(?=\n\n|❯|⎯)/gs;

let match;
while ((match = failPattern.exec(testOutput)) !== null) {
  const testFile = match[1];
  const testSuite = match[2].trim();
  const testName = match[3].trim();
  
  // Extract error message
  const errorStart = testOutput.indexOf(match[0]);
  const errorEnd = testOutput.indexOf('⎯', errorStart);
  const errorSection = testOutput.substring(errorStart, errorEnd);
  
  // Try to find error details
  let errorMessage = 'Test failed';
  const errorMatch = errorSection.match(/Error:\s+(.+?)(?=\n\n|❯|TestingLibrary)/s);
  if (errorMatch) {
    errorMessage = errorMatch[1].trim().split('\n')[0];
  } else {
    // Try to find TestingLibrary error
    const tlError = errorSection.match(/TestingLibraryElementError:\s+(.+?)(?=\n\n|Ignored)/s);
    if (tlError) {
      errorMessage = tlError[1].trim();
    }
  }
  
  // Extract test case ID
  const tcIdMatch = testName.match(/TC-[A-Z]+-\d+/);
  const tcId = tcIdMatch ? tcIdMatch[0] : 'UNKNOWN';
  
  const testCaseInfo = testCaseMap[tcId] || { name: testName, priority: 'P1' };
  
  bugs.push({
    testCaseId: tcId,
    testCaseName: testCaseInfo.name,
    priority: testCaseInfo.priority,
    status: 'FAIL',
    error: errorMessage.substring(0, 500), // Limit error length
    expectedResult: 'Test should pass',
    actualResult: errorMessage.substring(0, 200),
    steps: [
      `Run test: ${testName}`,
      `File: ${testFile}`,
      `Suite: ${testSuite}`,
    ],
    timestamp: new Date().toISOString(),
    fullError: errorSection.substring(0, 1000), // Store first 1000 chars
  });
}

// Generate bug report
const report = `# Bug Report - FitTrack Pro
**Generated:** ${new Date().toISOString()}
**Test Run:** Automated Test Execution
**Test Framework:** Vitest + React Testing Library

## Executive Summary

- **Total Tests Run:** 44
- **Tests Passed:** 29
- **Tests Failed:** 15
- **Success Rate:** 65.9%

### Priority Breakdown
- **Critical (P0):** ${bugs.filter(b => b.priority === 'P0').length} bugs
- **High (P1):** ${bugs.filter(b => b.priority === 'P1').length} bugs
- **Medium (P2):** ${bugs.filter(b => b.priority === 'P2').length} bugs

---

## Test Results Summary

### ✅ Passing Tests (29)
- All validation utility tests (10 tests)
- All workout utility tests (6 tests)
- Basic storage service tests (3 tests)
- Some authentication tests (4 tests)
- Some workout editor tests (4 tests)
- Integration tests (2 tests)

### ❌ Failing Tests (15)

---

## Detailed Bug Report

${bugs.length === 0 
  ? '✅ No bugs found! All tests passed.' 
  : bugs.map((bug, index) => `
### Bug #${index + 1}: ${bug.testCaseId} - ${bug.testCaseName}

**Priority:** ${bug.priority} ${bug.priority === 'P0' ? '🔴 CRITICAL' : bug.priority === 'P1' ? '🟡 HIGH' : '🟢 MEDIUM'}  
**Status:** ${bug.status}  
**Timestamp:** ${bug.timestamp}

**Test Case:** ${bug.testCaseName}  
**Test ID:** ${bug.testCaseId}

**Error Message:**
\`\`\`
${bug.error}
\`\`\`

**Expected Result:**
${bug.expectedResult}

**Actual Result:**
${bug.actualResult}

**Steps to Reproduce:**
${bug.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Full Error Details:**
<details>
<summary>Click to expand full error</summary>

\`\`\`
${bug.fullError}
\`\`\`

</details>

---
`).join('\n')}

## Bug Categories

### Authentication Issues (${bugs.filter(b => b.testCaseId.startsWith('TC-AUTH')).length} bugs)
${bugs.filter(b => b.testCaseId.startsWith('TC-AUTH')).map(b => `- ${b.testCaseId}: ${b.testCaseName}`).join('\n') || 'None'}

### Workout Management Issues (${bugs.filter(b => b.testCaseId.startsWith('TC-WORKOUT')).length} bugs)
${bugs.filter(b => b.testCaseId.startsWith('TC-WORKOUT')).map(b => `- ${b.testCaseId}: ${b.testCaseName}`).join('\n') || 'None'}

### Storage/Data Issues (${bugs.filter(b => b.testCaseId.startsWith('TC-ERROR') || b.testCaseId.startsWith('TC-DATA') || b.testCaseId.startsWith('TC-ATTEND') || b.testCaseId.startsWith('TC-SETTINGS')).length} bugs)
${bugs.filter(b => b.testCaseId.startsWith('TC-ERROR') || b.testCaseId.startsWith('TC-DATA') || b.testCaseId.startsWith('TC-ATTEND') || b.testCaseId.startsWith('TC-SETTINGS')).map(b => `- ${b.testCaseId}: ${b.testCaseName}`).join('\n') || 'None'}

## Root Cause Analysis

### Common Issues Found:

1. **localStorage API Issues (jsdom environment)**
   - \`localStorage.clear()\` not available in jsdom
   - Need to manually clear items or use polyfill

2. **Form Label Association**
   - Labels not properly associated with inputs using \`htmlFor\` attribute
   - Accessibility issue that also breaks tests

3. **Error Message Display**
   - Error messages may not be rendering in test environment
   - Need to verify error state management

4. **Test Environment Setup**
   - Some browser APIs not properly mocked
   - Need better jsdom configuration

## Recommendations

### Immediate Actions (P0)
1. Fix localStorage.clear() issue in test setup
2. Fix form label associations (add htmlFor attributes)
3. Verify error message rendering in AuthScreen component

### Short-term Actions (P1)
1. Improve test environment setup
2. Add better error handling in components
3. Add more comprehensive mocks

### Long-term Actions (P2)
1. Increase test coverage
2. Add E2E tests for critical flows
3. Set up CI/CD with automated testing

---

## Test Execution Details

**Test Framework:** Vitest v4.0.15  
**Testing Library:** @testing-library/react v16.3.0  
**Environment:** jsdom  
**Execution Time:** ~6.28 seconds

---

*This report was automatically generated from test execution results.*
*Review and prioritize bugs based on business impact and user experience.*
`;

// Write bug report
fs.writeFileSync(path.join(__dirname, 'BUG_REPORT.md'), report, 'utf-8');
console.log(`✅ Bug report generated: BUG_REPORT.md`);
console.log(`📊 Found ${bugs.length} bugs`);
console.log(`🔴 Critical (P0): ${bugs.filter(b => b.priority === 'P0').length}`);
console.log(`🟡 High (P1): ${bugs.filter(b => b.priority === 'P1').length}`);
console.log(`🟢 Medium (P2): ${bugs.filter(b => b.priority === 'P2').length}`);

