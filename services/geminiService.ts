
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Always use process.env.API_KEY directly for initialization
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async chat(companionName: string, roleDescription: string, message: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction: `You are ${companionName}, a helpful AI companion acting as a ${roleDescription}. Be friendly, concise, and professional.`,
          temperature: 0.7,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Sorry, I'm having trouble connecting right now. Can we try again later?";
    }
  }
}

export const geminiService = new GeminiService();
