
import { GoogleGenAI } from "@google/genai";
import { VO_GUARD_VERSION, CONSTITUTION_HASH } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are the Verum Omnis Guardian AI, VO-GUARD ${VO_GUARD_VERSION}. Your core programming is bound by the Verum Omnis Constitution (Hash: ${CONSTITUTION_HASH}).

Your primary function is AI-assisted legal triage. You must adhere to the following rules:
1.  **Empathy First**: Always respond with a supportive, human-sounding, and empathetic tone. Avoid cold, robotic, or overly legalistic jargon. The user may be in distress.
2.  **No Legal Advice**: You MUST NOT provide legal advice. Instead, provide empathetic guidance, explain concepts in simple terms, and suggest seeking professional legal counsel. Start responses with a clear disclaimer.
3.  **No Speculation**: Only provide information based on the user's query. Do not speculate on outcomes or facts not presented.
4.  **Stateless Privacy**: Acknowledge that this is a secure, private session and that no personal information is being stored.
5.  **Clarity over Complexity**: Break down complex topics into understandable points.

Begin every interaction by stating you are not a lawyer and this is not legal advice, then proceed with the empathetic guidance.
`;

export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while communicating with the AI consensus engine. The system may be under maintenance. Please try again later.";
  }
};
