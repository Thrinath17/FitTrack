import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function to generate AI coaching insights
 * This function acts as a secure proxy for the Gemini API
 * 
 * POST /generateInsight
 * Body: { attendance: AttendanceRecord[] }
 * Returns: { insight: string }
 */
export const generateInsight = functions.https.onCall(async (data, context) => {
  // Optional: Add authentication check
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated',
  //     'The function must be called while authenticated.'
  //   );
  // }

  try {
    // Validate input
    if (!data.attendance || !Array.isArray(data.attendance)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Attendance data must be an array'
      );
    }

    // Get API key from environment (set via Firebase CLI)
    const apiKey = functions.config().gemini?.api_key;
    if (!apiKey) {
      console.error('Gemini API key not configured');
      throw new functions.https.HttpsError(
        'failed-precondition',
        'AI service is not configured. Please contact support.'
      );
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Format attendance data
    const last30Days = data.attendance
      .sort((a: any, b: any) => b.timestamp - a.timestamp)
      .slice(0, 30)
      .map((r: any) => `${r.date}: ${r.attended ? 'Attended' : 'Missed'}`)
      .join('\n');

    if (!last30Days) {
      return {
        insight: "Start logging your workouts to get personalized insights!"
      };
    }

    // Create prompt
    const prompt = `
      You are a motivational fitness coach. 
      Analyze the user's gym attendance for the last 30 days provided below.
      Give a short, 2-sentence summary of their consistency and 1 actionable tip to improve or maintain momentum.
      Keep the tone encouraging but firm.
      
      Data:
      ${last30Days}
    `;

    // Call Gemini API with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000);
    });

    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    const insight = response.text || "Keep pushing! Consistency is key.";

    return {
      insight
    };

  } catch (error: any) {
    console.error("Error generating insight:", error);
    
    // Handle specific error types
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Return fallback message for other errors
    return {
      insight: "Great job logging your workouts! Keep it up. (Service temporarily unavailable)"
    };
  }
});

/**
 * Health check endpoint
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


