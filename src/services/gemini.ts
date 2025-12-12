/**
 * FRONTEND FILE — SAFE VERSION
 * ---------------------------------------------------------
 * ❌ NO GEMINI API KEY HERE
 * ❌ NO GoogleGenAI IMPORTS
 * ❌ NO AI CALLS IN FRONTEND
 * 
 * ✅ All system instructions, examples, and schema remain intact (as comments)
 * 
 * This file ONLY sends data to your backend server:
 *    `${API_BASE_URL}/api/translate`
 * The backend (Node.js server) will perform the actual Gemini call.
 */

import { TranslationResponse } from "../types";

/**
 * ---------------------------------------------------------
 * ORIGINAL SYSTEM INSTRUCTION (KEPT EXACTLY AS YOU WROTE IT)
 * ---------------------------------------------------------
 * This is now ONLY for reference.
 * The backend will load and use this instruction instead.
 */

const BASE_SYSTEM_INSTRUCTION = `
You are "Ramanya," an expert AI translator specializing in the Mon language (ISO 639-3: mnw).
You have deep knowledge of Mon grammar, vocabulary, and cultural nuances.

### MON LANGUAGE PRIMER (STRICT RULES):
- **Script**: Use standard Myanmar script for Mon (e.g., use 'ၜ' not 'ဗ' where appropriate).
- **Sentence Structure**: Typically Subject-Verb-Object (SVO).
- **Particles**:
  - Statement End: '... ရ' (Ra)
  - Polite Request: '... ညိ' (Nyi)
  - Question: '... ရော' (Rao) / '... ဟာ' (Ha)
  - Past Tense: '... တုဲ' (Toe)
  - Future: '... ရောင်' (Raung)
  - Continuous: '... မံင်' (Mang)

### FEW-SHOT TRAINING EXAMPLES (COPY THIS STYLE):

**Example 1 (English -> Mon):**
Input: "Where are you going?"
Output JSON: {
  "source_language": "English",
  "translation": "မၞး အာ အလဵု ရော?"
}

**Example 2 (English -> Mon):**
Input: "I am eating rice."
Output JSON: {
  "source_language": "English",
  "translation": "အဲ စမံင် ပုင် ရ။"
}

**Example 3 (Mon -> English):**
Input: "မၞး မံင်မိပ်မံင်ဟာ"
Output JSON: {
  "source_language": "Mon",
  "translation": "How are you doing?"
}

**Example 4 (English -> Mon):**
Input: "Thank you very much."
Output JSON: {
  "source_language": "English",
  "translation": "တင်ဂုဏ် ဗွဲမလောန် ရ။"
}

### INSTRUCTIONS:

IF INPUT IS ENGLISH:
1. Translate it into **Formal, Written Mon** (Unicode).
2. Ensure the tone is polite.

IF INPUT IS MON:
1. Translate it into **Natural, Fluent English**.

You must always reply in valid JSON format matching the schema provided. DO NOT provide notes or romanization.
`;

/**
 * ---------------------------------------------------------
 * ORIGINAL SCHEMA (KEPT EXACTLY AS YOU WROTE IT)
 * ---------------------------------------------------------
 * This is also now ONLY for reference.
 * The backend will validate schema.
 */

import { Type, Schema } from "@google/genai"; 
// 👆 Note: You can remove this import entirely if unnecessary.
// It's harmless but not used anymore in the frontend.

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    source_language: {
      type: Type.STRING,
      description: 'The detected source language (e.g., "English" or "Mon").',
    },
    translation: {
      type: Type.STRING,
      description: 'The translated text.',
    },
  },
  required: ["source_language", "translation"],
};

/**
 * ---------------------------------------------------------
 * SAFE FRONTEND FUNCTION
 * ---------------------------------------------------------
 * This sends the text + vocabulary to your backend API.
 * No API key is ever exposed to the browser.
 */

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "https://moncbserver-main.onrender.com";

export const sendMessageToGemini = async (
  message: string
): Promise<TranslationResponse> => {
  const resp = await fetch(`${API_BASE_URL}/api/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!resp.ok) {
    console.error("Backend error:", await resp.text());
    throw new Error("Backend returned an error");
  }

  const data = await resp.json();
  return data as TranslationResponse;
};