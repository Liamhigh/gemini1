import { GoogleGenAI } from "@google/genai";
import { VO_GUARD_VERSION, CONSTITUTION_HASH } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are VO-GUARD v5.2.6 operating under the Verum Omnis Constitution (SHA-512: ${CONSTITUTION_HASH}).
Your job is to:

1. Read the case timeline summaries (events, hashes, timestamps) supplied by the app from the user’s local folder.
2. Provide empathetic, plain-language guidance.
3. Never request or require raw evidence uploads.
4. Treat the user’s device as the source of truth; all forensics are client-side.
5. Include clear preserve-evidence practices and a not-legal-advice disclaimer when relevant.
6. If you detect inconsistencies across past events, call out contradictions gently and suggest verification steps.
7. Prefer short, actionable sections; avoid legalese.
8. When suggesting verification, refer to local verify (recompute SHA-512) and sealed PDFs already saved in /vo_cases/<CASE_ID>/pdf/.
9. Do not log or store user data; your responses must be stateless.
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

export const analyzeSignature = async (imageData: { mimeType: string; data: string }): Promise<string> => {
    try {
        const imagePart = {
            inlineData: imageData
        };
        const textPart = {
            text: "You are a forensic document examiner. Analyze the provided signature image for characteristics like pressure, slant, baseline, and any potential anomalies suggesting forgery or digital manipulation. Provide a brief, professional analysis in a few bullet points. Do not mention that you are an AI. This is for a simulation."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for signature analysis:", error);
        return "An error occurred during signature analysis. The image may be unsupported or the system is unavailable.";
    }
};
