import { GoogleGenAI, Type } from "@google/genai";
import { MessageTurn, TicketDraft, TicketPriority } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTicketFromTranscript = async (transcript: MessageTurn[]): Promise<TicketDraft> => {
  const ai = getClient();

  // Format transcript for the prompt
  const conversationText = transcript
    .map(t => `${t.role.toUpperCase()}: ${t.text}`)
    .join('\n');

  const prompt = `
    You are an expert IT Support Agent. Analyze the following conversation transcript between a User and a Support AI.
    Extract the core issue into a structured ticket.
    
    Transcript:
    ${conversationText}
    
    Extract:
    1. A concise title (max 8 words).
    2. A detailed description of the issue.
    3. The likely software component involved (e.g., "Login", "Checkout", "Navigation").
    4. A priority level (LOW, MEDIUM, HIGH, CRITICAL).
    5. Hints for filenames that might be relevant (e.g., "Login.tsx", "api/auth.ts").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            component: { type: Type.STRING },
            priority: { type: Type.STRING, enum: Object.values(TicketPriority) },
            file_hints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "priority"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from model");

    return JSON.parse(jsonText) as TicketDraft;

  } catch (error) {
    console.error("Failed to extract ticket:", error);
    throw new Error("Failed to generate ticket from transcript.");
  }
};
