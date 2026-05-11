import { GoogleGenAI, Type, Schema } from "@google/genai";

// Default model to use
const MODEL_NAME = "gemini-2.5-flash";

/**
 * Get a rotated API key from env or fallback to default
 */
export function getRotatedApiKey(customApiKey?: string): string | undefined {
  if (customApiKey) return customApiKey;
  
  const envKeysString = import.meta.env?.VITE_GEMINI_API_KEYS || process.env.GEMINI_API_KEYS;
  let keys: string[] = [];
  if (envKeysString && envKeysString.trim() !== '') {
    keys = envKeysString.split(',').map((k: string) => k.trim()).filter((k: string) => k);
  }
  
  if (keys.length === 0) {
    keys = [
      "AIzaSyB0Fe9P3MaJ8xOt3cqPOId0eUeklcr28q8",
      "AIzaSyA67jcs2i0lA363sUYTdDXft56lq57Dt_w",
      "AIzaSyA30FQre53g5Apbm8JHpXN0u9Ts0Y702Wo",
      "AIzaSyAqbGRXSbJzXZ3qNG3W6lwh3rzk5rEO6Lo",
      "AIzaSyBPZ8pIT-_mjtkO0X8IhR5dc2Otls8FyoY",
      "AIzaSyCgwDLsTfgEjC12uUU02TnVg3QWiVRB7d0",
      "AIzaSyB38kLffX2kMwj3zNU1N1PnJbkZtobZb7k",
      "AIzaSyC01_x09yPFE0RP0-rpbR3-5-iFp6GuBn0",
      "AIzaSyB40UvYVgLDIMhmJEkj_DP8dVszhQe3hNo",
      "AIzaSyASGm5ZYnWhHtAb3g54kt39KONx7x0HzTE",
      "AIzaSyDV-jNIIju5ZGcTERemv04wnpAttToS6aE",
      "AIzaSyD6z3wQQgkgi8fQv7t-E-xUtq5MB5u9Tas",
      "AIzaSyD7I5sq96fIsmJlWn-JsBk0u6pVQ5cmY_U",
      "AIzaSyDyvVtOQsuMxVmWMSfEEYTm6TAq31JTrCw",
      "AIzaSyD36JBcb5YKKoAO9U28d7H0HsfkUyhL0RM",
      "AIzaSyDAAilGLB1y5qe3GjURkhGesp2TzsXs6BE",
      "AIzaSyBSNMgaJxWHoi9HFupZqGE0GOoBUJA1HDI",
      "AIzaSyBxnZaA3fF4PSgmb4PWs3-LYdaK4Cu7V1M",
      "AIzaSyDb5Ai9DHdNHLtaC7geL3K5vxv7JUhTGmY",
      "AIzaSyCX69uZ0yHCaYf6CeOIIdtTSnCPQ8arpqg",
    ];
  }

  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Generate structured JSON content using Gemini
 */
export async function generateContentObj(prompt: string, schema: Schema, customApiKey?: string) {
  const apiKey = getRotatedApiKey(customApiKey);
  if (!apiKey) throw new Error("API Key tidak ditemukan.");
  const ai = new GoogleGenAI({ apiKey });
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
  const ai = new GoogleGenAI({ apiKey });
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
