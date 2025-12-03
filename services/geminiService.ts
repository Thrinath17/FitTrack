import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

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

  const prompt = `
    You are a motivational fitness coach. 
    Analyze the user's gym attendance for the last 30 days provided below.
    Give a short, 2-sentence summary of their consistency and 1 actionable tip to improve or maintain momentum.
    Keep the tone encouraging but firm.
    
    Data:
    ${last30Days}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Keep pushing! Consistency is key.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Great job logging your workouts! Keep it up.";
  }
};