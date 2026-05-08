import { GoogleGenAI, Type, Schema } from "@google/genai";

// Default model to use
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Get a rotated API key from env or fallback to default
 */
export function getRotatedApiKey(customApiKey?: string): string | undefined {
  if (customApiKey) return customApiKey;
  
  const envKeysString = process.env.GEMINI_API_KEYS;
  if (envKeysString && envKeysString.trim() !== '') {
    const keys = envKeysString.split(',').map(k => k.trim()).filter(k => k);
    if (keys.length > 0) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      return keys[randomIndex];
    }
  }

  return process.env.GEMINI_API_KEY;
}

/**
 * Generate structured JSON content using Gemini
 */
export async function generateContentObj(prompt: string, schema: Schema, customApiKey?: string) {
  const apiKey = getRotatedApiKey(customApiKey);
  if (!apiKey) throw new Error("API Key tidak ditemukan.");
  // @ts-ignore
  const ai = new GoogleGenAI({ apiKey, httpOptions: { fetch: window.fetch.bind(window) } as any });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      },
    });
    
    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating JSON content:", error);
    throw error;
  }
}

/**
 * Generate standard text/markdown content using Gemini
 */
export async function generateContentText(prompt: string, customApiKey?: string) {
  const apiKey = getRotatedApiKey(customApiKey);
  if (!apiKey) throw new Error("API Key tidak ditemukan.");
  // @ts-ignore
  const ai = new GoogleGenAI({ apiKey, httpOptions: { fetch: window.fetch.bind(window) } as any });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text content:", error);
    throw error;
  }
}
