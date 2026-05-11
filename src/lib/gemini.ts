// Default model to use
const MODEL_NAME = "gemini-2.5-flash";

export enum Type {
  STRING = "string",
  NUMBER = "number",
  INTEGER = "integer",
  BOOLEAN = "boolean",
  ARRAY = "array",
  OBJECT = "object",
}


/**
 * Get a rotated API key from env or fallback to default
 */
export function getRotatedApiKey(customApiKey?: string): string | undefined {
  if (customApiKey) return customApiKey;
  
  let envKeysString = undefined;
  try {
    envKeysString = import.meta.env?.VITE_GEMINI_API_KEYS;
  } catch (e) {
    // Ignore
  }
  
  if (!envKeysString && typeof process !== 'undefined' && process.env) {
    envKeysString = process.env.GEMINI_API_KEYS;
  }
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
export async function generateContentObj(prompt: string, schema: any, customApiKey?: string, retries = 3): Promise<any> {
  const apiKey = getRotatedApiKey(customApiKey);
  if (!apiKey) throw new Error("API Key tidak ditemukan.");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    if (retries > 0) {
      console.warn(`Generating JSON content failed. Retrying... (${retries} attempts left)`);
      return generateContentObj(prompt, schema, customApiKey, retries - 1);
    }
    console.error("Error generating JSON content:", error);
    throw error;
  }
}

/**
 * Generate standard text/markdown content using Gemini
 */
export async function generateContentText(prompt: string, customApiKey?: string, retries = 3): Promise<string | undefined> {
  const apiKey = getRotatedApiKey(customApiKey);
  if (!apiKey) throw new Error("API Key tidak ditemukan.");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Generating text content failed. Retrying... (${retries} attempts left)`);
      return generateContentText(prompt, customApiKey, retries - 1);
    }
    console.error("Error generating text content:", error);
    throw error;
  }
}
