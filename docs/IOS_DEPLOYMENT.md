# iOS App Store Deployment - Step-by-Step Guide

## ✅ What's Already Done

- ✅ Capacitor installed and initialized
- ✅ iOS platform added
- ✅ Mobile configuration updated
- ✅ App built and synced

---

## 🚀 Next Steps (In Order)

### STEP 1: Complete Firebase Backend (REQUIRED - 10 min)

**Why first?** App Store will reject apps with exposed API keys. You must move your Gemini API key to Firebase Functions.

#### 1.1 Get Firebase Config
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **FitTrack Pro** project
3. Click ⚙️ (gear icon) → **Project settings**
4. Scroll to **"Your apps"** section
5. Click web icon `</>` → **Register app**
6. App nickname: **FitTrack Pro Web**
7. **Copy all the config values** (you'll need them)

#### 1.2 Set Environment Variables
```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIzaSyC... (your actual key)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

#### 1.3 Initialize Firebase
```bash
firebase login
firebase init
```

**When prompted:**
- Select: **Functions** (use spacebar, then Enter)
- Skip Hosting for now (we're doing mobile first)
- Use existing project → Select your FitTrack Pro project
- Language: **TypeScript**
- ESLint: Yes (or No)
- Install dependencies: **Yes**
- **Say NO to overwrite** existing files (firebase.json, functions/package.json, etc.)

#### 1.4 Set Gemini API Key Securely
```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

Replace `YOUR_GEMINI_API_KEY` with your actual key (no quotes if no spaces).

#### 1.5 Deploy Functions
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Wait for deployment to complete. You should see:
```
✔  functions[generateInsight(us-central1)] Successful create operation.
```

✅ **Backend is now secure!**

---

### STEP 2: Open in Xcode (5 min)

```bash
npx cap open ios
```

This opens Xcode with your iOS project.

---

### STEP 3: Configure in Xcode (15 min)

#### 3.1 Set Up Signing

In Xcode:
1. Select **FitTrack Pro** project (left sidebar, blue icon)
2. Select **FitTrack Pro** target (under TARGETS)
3. Go to **"Signing & Capabilities"** tab
4. **Team:** Select your Apple Developer account
   - If you don't have one, click **"Add Account"**
   - Sign in with your Apple ID
   - For App Store, you'll need paid Developer account ($99/year)
5. **Bundle Identifier:** `com.fittrack.pro` (or change if needed)
6. Xcode will automatically create provisioning profiles

#### 3.2 Configure App Settings

**General Tab:**
- Display Name: **FitTrack Pro**
- Version: **1.0.0**
- Build: **1**
- Minimum Deployments: **iOS 13.0** (or higher)

**Info Tab:**
- Review Info.plist settings
- Add any required permissions if needed

#### 3.3 Test on Simulator

1. At the top, select a simulator (e.g., "iPhone 15 Pro")
2. Click **Run** button (▶️) or press `Cmd + R`
3. App should launch in simulator
4. Test all features:
   - Sign in
   - Create workout
   - Log attendance
   - View analytics
   - Test AI insights

#### 3.4 Test on Real Device (Recommended)

1. Connect iPhone via USB
2. In Xcode, select your device from the device dropdown
3. Click **Run**
4. On iPhone: **Settings** → **General** → **VPN & Device Management**
5. Trust your developer certificate
6. App should launch on your iPhone
7. Test thoroughly!

---

### STEP 4: Create App Assets (2-3 hours)

#### 4.1 App Icon

**Required:** 1024x1024px PNG (no transparency)

**How to create:**
1. Design your icon (or use a tool)
2. Export as 1024x1024 PNG
3. In Xcode:
   - Select project → **FitTrack Pro** target
   - Go to **App Icons and Launch Images**
   - Drag your 1024x1024 icon to the AppIcon set
   - Xcode will generate all required sizes automatically

#### 4.2 Screenshots

**Required sizes:**
- iPhone 6.7" (1290 x 2796) - iPhone 14 Pro Max, 15 Pro Max
- iPhone 6.5" (1284 x 2778) - iPhone 11 Pro Max, XS Max  
- iPhone 5.5" (1242 x 2208) - iPhone 8 Plus

**How to take:**
1. Run app on simulator or device
2. Navigate to each main screen:
   - Workouts view
   - Calendar view
   - Analytics/Dashboard
   - Settings
3. Take screenshots:
   - **Simulator:** `Cmd + S`
   - **Device:** Power + Volume Up
4. Save screenshots to a folder

**Screenshots needed:**
- At least 2 screenshots per size
- Show key features
- First screenshot is most important (appears first in store)

#### 4.3 Privacy Policy (REQUIRED)

You **MUST** have a privacy policy URL for App Store submission.

**Quick options:**
1. **GitHub Pages** (free):
   - Create `privacy-policy.md` in your repo
   - Enable GitHub Pages
   - Use the URL

2. **Netlify** (free):
   - Create HTML file
   - Deploy to Netlify
   - Use the URL

3. **Your own domain** (if you have one)

**Privacy Policy should include:**
- What data you collect
- How you use it
- Third-party services (Firebase, Gemini AI)
- User rights
- Contact information

---

### STEP 5: Apple Developer Account ($99/year)

#### 5.1 Enroll (if not done)

1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in with Apple ID
3. Click **"Account"** → **"Enroll"**
4. Complete enrollment:
   - Personal information
   - Payment ($99/year)
   - Agreement
5. **Wait for approval** (usually instant, can take up to 48 hours)

#### 5.2 Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles**
3. **Identifiers** → **+** button
4. Select **App IDs** → **Continue**
5. **App ID Prefix:** Use Team ID
6. **Description:** FitTrack Pro
7. **Bundle ID:** `com.fittrack.pro` (must match Xcode)
8. **Capabilities:** Select what you need (usually none for now)
9. **Register**

---

### STEP 6: App Store Connect Setup (30 min)

#### 6.1 Create App

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** FitTrack Pro
   - **Primary Language:** English
   - **Bundle ID:** Select `com.fittrack.pro` from dropdown
   - **SKU:** `fittrack-pro-001` (unique identifier, can be anything)
   - **User Access:** Full Access
4. Click **Create**

#### 6.2 App Information

1. **Category:** Health & Fitness
2. **Privacy Policy URL:** (REQUIRED - paste your URL)
3. **Subtitle:** Track workouts & stay consistent (30 chars max)

#### 6.3 Pricing

- **Price:** Free (or set price)
- **Availability:** All countries (or select specific)

---

### STEP 7: Build and Archive (15 min)

#### 7.1 Update Version in Xcode

1. In Xcode, select project
2. **General** tab
3. **Version:** `1.0.0`
4. **Build:** `1` (increment for each update)

#### 7.2 Archive

1. In Xcode: **Product** → **Archive**
2. Wait for build to complete (can take a few minutes)
3. **Organizer** window opens automatically

#### 7.3 Distribute to App Store

1. In Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Click **Next**
5. **Upload** (not Export)
6. Click **Next**
7. Select options (usually defaults are fine)
8. Click **Upload**
9. Wait for upload (can take 10-30 minutes)
10. You'll see "Upload Successful"

---

### STEP 8: Complete App Store Listing (30 min)

#### 8.1 Version Information

In App Store Connect:
1. Go to your app
2. **App Store** tab
3. **+ Version or Platform** → iOS
4. Fill in:

**What's New in This Version:**
```
Initial release of FitTrack Pro!

Track your gym attendance, manage workout routines, and get AI-powered coaching insights to stay motivated and consistent.
```

#### 8.2 Screenshots

1. Upload screenshots for each required size
2. Drag to reorder (first is most important)
3. Add captions (optional but recommended)

#### 8.3 Description

**Name:** FitTrack Pro (30 chars max)

**Subtitle:** Track workouts & stay consistent (30 chars max)

**Description:**
```
FitTrack Pro helps you build consistent gym habits through simple attendance tracking and AI-powered insights.

KEY FEATURES:
✓ Quick attendance logging
✓ Custom workout routines  
✓ AI coaching insights
✓ Visual progress tracking
✓ Calendar view

Track your fitness journey and stay motivated!
```

**Keywords:** fitness, gym, workout, tracking, health, attendance, routine (100 chars max, comma-separated)

**Support URL:** Your website or GitHub repo
**Marketing URL:** (Optional)

#### 8.4 App Privacy

1. Click **App Privacy**
2. Answer questions:
   - **Does your app collect data?** Yes
   - **Types:** Health & Fitness, User Content
   - **Purpose:** App Functionality, Analytics (if using)
   - **Linked to user:** Yes (if users sign in)
   - **Used for tracking:** No (unless you use ads)
3. Click **Save**

#### 8.5 Age Rating

Complete questionnaire:
- All answers: **No** (unless you have specific content)
- **Result:** Should be **4+** (Everyone)

---

### STEP 9: Submit for Review (5 min)

#### 9.1 Final Checklist

- [ ] Firebase Functions deployed (API key secure)
- [ ] App tested on real device
- [ ] All features working
- [ ] App icon added (1024x1024)
- [ ] Screenshots uploaded (all required sizes)
- [ ] Description complete
- [ ] Privacy policy URL added
- [ ] Age rating completed
- [ ] App privacy configured
- [ ] Build uploaded to App Store Connect

#### 9.2 Submit

1. In App Store Connect, go to your app version
2. Scroll to **Build** section
3. Click **+** next to Build
4. Select your uploaded build
5. Click **Done**
6. Scroll up, click **Add for Review**
7. Answer export compliance questions:
   - **Encryption:** Yes (if using HTTPS, which you are)
   - **Uses encryption:** Yes
   - **Exempt:** Yes (standard HTTPS)
8. Click **Submit for Review**

---

### STEP 10: Wait for Review

- **Typical time:** 24-48 hours
- **Status:** Check App Store Connect regularly
- **Notifications:** You'll get email when status changes

**Possible outcomes:**
- ✅ **Approved:** App goes live!
- ❌ **Rejected:** Review rejection reasons, fix issues, resubmit

---

## 🎯 Current Status

✅ **Completed:**
- Capacitor installed
- iOS platform added
- Mobile configuration done
- App built and synced

⏳ **Next (In Order):**
1. Firebase backend setup (REQUIRED - 10 min)
2. Open in Xcode (5 min)
3. Configure signing (15 min)
4. Test on device (30 min)
5. Create assets (2-3 hours)
6. Apple Developer enrollment (if needed)
7. App Store Connect setup (30 min)
8. Build & upload (15 min)
9. Submit (5 min)

---

## 💰 Cost

- **Apple Developer:** $99/year (required)
- **Firebase:** $0/month (free tier)
- **Total:** ~$100 first year

---

## ⚡ Quick Commands Reference

```bash
# After Firebase setup, rebuild and sync:
npm run build
npx cap sync ios
npx cap open ios

# To update app after changes:
npm run build
npx cap sync ios
# Then rebuild in Xcode
```

---

## 🆘 Need Help?

If you get stuck:
1. Check which step you're on
2. Read error messages carefully
3. Check Firebase Console for function logs
4. Check Xcode console for app errors

**Let's start with Firebase backend setup - it's critical!**


