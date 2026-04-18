/**
 * Firebase Configuration for Frontend
 * Initialize Firebase in your app
 */
import { initializeApp, getApps } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is already initialized (prevents duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Cloud Functions
const functions = getFunctions(app);

// Connect to emulator in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

/**
 * Call the generateInsight Cloud Function
 * Returns null if Firebase is not configured
 */
export const generateInsight = firebaseConfig.apiKey 
  ? httpsCallable(functions, 'generateInsight')
  : null;

export { app, functions };

