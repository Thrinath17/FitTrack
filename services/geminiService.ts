import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";
import { getAPIErrorMessage } from "../utils/errors";

/**
 * Gets the AI client instance
 * @returns GoogleGenAI client or null if API key is not configured
 * 
 * @warning SECURITY: API keys exposed in client-side code are a security risk.
 * In production, this should be moved to a backend proxy service.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not configured. AI features will be unavailable.');
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    return null;
  }
};

/**
 * Generates AI-powered coaching insights based on attendance data
 * @param attendance - Array of attendance records
 * @returns A motivational message with insights and tips
 * 
 * @throws Error if API call fails (returns fallback message instead)
 */
export const generateCoachInsight = async (attendance: AttendanceRecord[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) {
    return "AI Coach is unavailable. Please check your API Key configuration.";
  }

  // Format data for the prompt
  const last30Days = attendance
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 30)
    .map(r => `${r.date}: ${r.attended ? 'Attended' : 'Missed'}`)
    .join('\n');

  if (!last30Days) {
    return "Start logging your workouts to get personalized insights!";
  }

  const prompt = `
    You are a motivational fitness coach. 
    Analyze the user's gym attendance for the last 30 days provided below.
    Give a short, 2-sentence summary of their consistency and 1 actionable tip to improve or maintain momentum.
    Keep the tone encouraging but firm.
    
    Data:
    ${last30Days}
  `;

  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });

    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    return response.text || "Keep pushing! Consistency is key.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    const errorMessage = getAPIErrorMessage(error);
    // Return a fallback message instead of throwing
    return `Great job logging your workouts! Keep it up. (${errorMessage})`;
  }
};