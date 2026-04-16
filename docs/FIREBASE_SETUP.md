# Firebase Backend Setup Guide

## Overview

This guide will help you set up Firebase backend for FitTrack Pro, moving the Gemini API key to a secure server-side environment.

## Prerequisites

- Firebase account (free tier available)
- Node.js installed
- Firebase CLI installed (already done)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: **FitTrack Pro**
4. Enable Google Analytics (optional, recommended)
5. Click "Create project"
6. Wait for project creation to complete

---

## Step 2: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register app name: **FitTrack Pro Web**
6. Copy the Firebase configuration object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase config values:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

---

## Step 4: Initialize Firebase in Your Project

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init
   ```

3. Select the following options:
   - ✅ Functions: Configure a Cloud Functions directory
   - ✅ Hosting: Configure files for Firebase Hosting
   - Use an existing project: Select your Firebase project
   - Functions language: TypeScript
   - ESLint: Yes (optional)
   - Install dependencies: Yes

4. When asked about overwriting files, choose:
   - `firebase.json`: **N** (we already created it)
   - `functions/package.json`: **N** (we already created it)
   - `functions/tsconfig.json`: **N** (we already created it)

---

## Step 5: Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

---

## Step 6: Set Gemini API Key in Firebase Functions

**IMPORTANT:** Never commit API keys to git. Store them in Firebase Functions config.

1. Set the Gemini API key in Firebase Functions config:
   ```bash
   firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"
   ```

2. Verify it's set:
   ```bash
   firebase functions:config:get
   ```

---

## Step 7: Build and Deploy Functions

1. Build the functions:
   ```bash
   cd functions
   npm run build
   cd ..
   ```

2. Deploy functions to Firebase:
   ```bash
   firebase deploy --only functions
   ```

3. Wait for deployment to complete. You'll see output like:
   ```
   ✔  functions[generateInsight(us-central1)] Successful create operation.
   ✔  functions[healthCheck(us-central1)] Successful create operation.
   ```

---

## Step 8: Update Frontend to Use Firebase

The frontend code has already been updated to use Firebase Functions. Make sure:

1. `firebase-config.ts` is properly configured
2. `.env.local` has your Firebase config
3. The app imports from `firebase-config.ts`

---

## Step 9: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the AI insight feature:
   - Navigate to Analytics page
   - Click "Analyze My Consistency"
   - Should call Firebase Function instead of direct API

3. Check Firebase Console:
   - Go to Functions section
   - Check logs for any errors

---

## Step 10: Local Development (Optional)

To test functions locally before deploying:

1. Start Firebase emulators:
   ```bash
   cd functions
   npm run serve
   ```

2. Update `firebase-config.ts` to use emulator (for local testing only):
   ```typescript
   import { connectFunctionsEmulator } from 'firebase/functions';

   // Only in development
   if (import.meta.env.DEV) {
     connectFunctionsEmulator(functions, 'localhost', 5001);
   }
   ```

---

## Security Checklist

- [x] API key moved to Firebase Functions
- [x] API key stored in Firebase config (not in code)
- [x] `.env.local` added to `.gitignore`
- [x] Frontend no longer has direct API access
- [ ] Functions have proper error handling
- [ ] Consider adding authentication requirement
- [ ] Consider adding rate limiting

---

## Troubleshooting

### Error: "Firebase not initialized"
- Check that `.env.local` exists and has correct values
- Verify `firebase-config.ts` is imported correctly
- Check browser console for errors

### Error: "functions/unauthenticated"
- Functions are currently open (no auth required)
- To add auth, uncomment auth check in `functions/src/index.ts`

### Error: "API key not configured"
- Run: `firebase functions:config:set gemini.api_key="YOUR_KEY"`
- Redeploy: `firebase deploy --only functions`

### Functions not deploying
- Check you're logged in: `firebase login`
- Check project: `firebase use --list`
- Set project: `firebase use your-project-id`

---

## Next Steps

1. ✅ Firebase project created
2. ✅ Functions deployed
3. ✅ Frontend updated
4. ⏭️ Test in production
5. ⏭️ Add authentication (optional)
6. ⏭️ Add rate limiting (optional)
7. ⏭️ Monitor usage in Firebase Console

---

## Cost Estimation

**Firebase Free Tier (Spark Plan):**
- Functions: 2 million invocations/month (free)
- Hosting: 10 GB storage, 360 MB/day transfer (free)
- **Total: $0/month** for small to medium usage

**If you exceed free tier:**
- Functions: $0.40 per million invocations
- Hosting: $0.026 per GB storage, $0.15 per GB transfer

For FitTrack Pro, you'll likely stay within the free tier unless you have thousands of active users.

---

## Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Check browser console
3. Verify environment variables
4. Check Firebase Functions logs: `firebase functions:log`

Good luck! 🚀


