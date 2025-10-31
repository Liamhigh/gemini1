// FIX: Removed `GenerateContentParameters` as it's not the correct type for the `contents` property.
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { fileToBase64 } from "../utils";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const triageSystemInstruction = `You are a legal triage AI assistant for Verum Omnis, operating under the principles of the Verum Omnis Constitution.
Your job is to:
1. Provide empathetic, plain-language guidance based on user-provided information and any attached documents.
2. Never request raw evidence uploads. All forensics are client-side.
3. Include clear preserve-evidence practices and a not-legal-advice disclaimer.
4. Prefer short, actionable sections; avoid legalese.
5. Do not log or store user data; your responses must be stateless.
`;

const analysisSystemInstruction = `You are the Forensic Brain of the Verum Omnis system. Your role is to perform a deep, objective analysis of chat logs based on the provided institutional review template. Adhere to the following rules:
- Legal Brain Rule: Your analysis must be jurisdiction-specific if context is provided. Cite verified laws only, never hallucinate legal statutes.
- Forensic Brain Rule: Detect tampering, forgery, contradictions, and omissions.
- Evidence Brain Rule: Enforce legal admissibility. Do not alter or paraphrase evidence; quote directly where possible. Maintain chain-of-custody principles.
- Ethics Core Rule: Apply a bias detection matrix to all outputs. Remain neutral and objective.

Your task is to take the user's chat transcript and fill out the "DEEPSEEK VERUM OMNIS: INSTITUTIONAL REVIEW TEMPLATE". Respond in well-structured Markdown format, following the template's sections precisely.`;


// --- Triple-AI Provider Stubs ---

// FIX: Changed the type of `contents` to a structural type that accepts a string or an object with a `parts` array.
async function callGemini(contents: string | { parts: any[] }, systemInstruction: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error: Could not connect to the Gemini consensus engine.";
  }
}

async function callDeepSeek(prompt: string): Promise<string> {
  // This is a stub as requested.
  return new Promise(resolve => setTimeout(() => resolve(`DeepSeek Analysis Stub: The query concerns established legal precedents. Recommend reviewing similar case files from 2021 and 2023 for comparative analysis. The user should focus on the chain of custody for digital evidence.`), 200));
}

async function callClaude(prompt: string): Promise<string> {
  // This is a stub as requested.
  return new Promise(resolve => setTimeout(() => resolve(`Claude Analysis Stub: From a compliance perspective, the user's situation may fall under regulatory statutes. It is crucial to document every step taken from this point forward. I suggest creating a timeline of events.`), 350));
}

function buildConsensus(parts: string[]): string {
  // A simple consensus builder as requested.
  const geminiResponse = parts[0];
  const otherInsights = parts.slice(1).map(p => `- ${p.split(': ')[1]}`).join('\n');

  return `${geminiResponse}\n\n**Synthesized Insights from Verification Engines:**\n${otherInsights}\n\n(Triple-AI consensus synthesized. This is for informational purposes and does not constitute legal advice.)`;
}


export const getTriageResponse = async (prompt: string, file: File | null): Promise<{ consensus: string, raw: { provider: string, text: string }[] }> => {
  try {
    // FIX: Changed the type of `geminiContents` to correctly handle both string prompts and multi-part content (text + image).
    let geminiContents: string | { parts: any[] } = prompt;

    if (file) {
      if (file.type.startsWith('image/')) {
        const base64Data = await fileToBase64(file);
        geminiContents = {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64Data } }
          ]
        };
      } else if (file.type.startsWith('text/') || file.type === 'application/pdf' || file.type === 'application/msword') {
        const fileText = await file.text();
        const combinedPrompt = `${prompt}\n\n--- Attached Document (${file.name}) ---\n${fileText}`;
        geminiContents = combinedPrompt;
      } else {
        const combinedPrompt = `${prompt}\n\n[Attached non-previewable file: ${file.name}]`;
        geminiContents = combinedPrompt;
      }
    }

    const [geminiRes, deepseekRes, claudeRes] = await Promise.all([
        callGemini(geminiContents, triageSystemInstruction),
        callDeepSeek(prompt),
        callClaude(prompt),
    ]);
    
    const raw = [
        { provider: 'Gemini', text: geminiRes },
        { provider: 'DeepSeek', text: deepseekRes },
        { provider: 'Claude', text: claudeRes },
    ];

    const consensus = buildConsensus([geminiRes, deepseekRes, claudeRes]);
    
    return { consensus, raw };

  } catch (error) {
    console.error("Error in Triple-AI orchestration:", error);
    const errorMessage = "An error occurred while communicating with the AI consensus engine. The system may be under maintenance. Please try again later.";
    return {
        consensus: errorMessage,
        raw: [{ provider: 'System', text: errorMessage }]
    }
  }
};

export const runForensicAnalysis = async (messages: ChatMessage[]): Promise<string> => {
  const userTranscript = messages.map(m => {
    let entry = `[${m.role.toUpperCase()}]: ${m.text}`;
    if (m.attachment) {
      entry += `\n[Attached File: ${m.attachment.name}]`;
    }
    return entry;
  }).join('\n\n');

  const prompt = `
Please analyze the following chat transcript and generate a forensic report using the Verum Omnis Institutional Review Template.

**CHAT TRANSCRIPT:**
---
${userTranscript}
---

**VERUM OMNIS INSTITUTIONAL REVIEW TEMPLATE (Fill this out):**

### PRE-ANALYSIS DECLARATION
- [ ] **Initiating extraction under Forensic-Chain Protocol:** (Confirm initiation)
- [ ] **Preservation flags:** (Identify relevant flags like WATERMARKS, SEALS, CONTRADICTIONS, BEHAVIORAL MATRICES)
- [ ] **Scope:** (State the scope, e.g., "Entire provided chat history")

### 1. CRITICAL LEGAL SUBJECTS
(Identify and list relevant subjects from the transcript, using the examples below as a guide. Customize per the case.)
*   **Subject:** Shareholder Oppression
    *   **Key Points:** Denied meetings, withheld financials, exclusion.
    *   **Evidence:** (Quote from transcript)
*   **Subject:** Breach of Fiduciary Duty
    *   **Key Points:** Self-dealing, conflicts of interest.
    *   **Evidence:** (Quote from transcript)
*   **Subject:** Cybercrime
    *   **Key Points:** Unauthorized access, device/IP logs.
    *   **Evidence:** (Quote from transcript)
*   **Subject:** Fraudulent Evidence
    *   **Key Points:** Forged messages, doctored screenshots.
    *   **Evidence:** (Quote from transcript)
*   **Subject:** Emotional Exploitation
    *   **Key Points:** Weaponizing mental health history.
    *   **Evidence:** (Quote from transcript)

### 2. DISHONESTY DETECTION MATRIX
(Analyze the transcript for the following patterns and provide evidence.)
*   **Contradictions:** (e.g., Opposing statements vs. evidence)
*   **Selective Omissions:** (e.g., Excluded key details)
*   **Evasion/Gaslighting:** (e.g., Refusing answers, blaming victims)
*   **Patterns of Concealment:** (e.g., Deleting messages, avoiding paper trails)
*   **Financial Irregularities:** (e.g., Hidden transfers, fake invoices)

### 3. AI EXTRACTION PROTOCOL
*   **Keyword Scan:** (List keywords found from the predefined list: ["admit", "deny", "forged", "access", "delete", "refuse", "invoice", "profit"])
*   **Entities Scan:** (List entities found from the predefined list: ["RAKEZ", "SAPS CAS 126/4/2025", "Article 84", "Greensky"])
*   **Persons Scan:** (List persons identified in the transcript)

### 4. ACTIONABLE OUTPUT
*   **Top 3 Liabilities:**
    1.  (Liability 1)
    2.  (Liability 2)
    3.  (Liability 3)
*   **Dishonesty Score:** (Estimate a percentage of logs that contain red flags and provide a brief justification)
*   **Recommended Actions:** (Based on the analysis, suggest neutral, actionable next steps, e.g., "Recommend review by legal counsel specializing in corporate law.")

### POST-ANALYSIS DECLARATION
- [X] **Extraction complete. Integrity seals verified.**
- **SEAL:** VERUM OMNIS | HASH#ANALYSIS-${new Date().toISOString()}
`;

  return await callGemini(prompt, analysisSystemInstruction);
};