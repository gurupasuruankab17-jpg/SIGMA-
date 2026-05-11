// Default model to use
const MODEL_NAME = "gemini-2.5-flash";

export enum Type {
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
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
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      keys = [process.env.GEMINI_API_KEY];
    } else {
      // In web browser with Vite without specific injection
      try {
         if (import.meta.env?.VITE_GEMINI_API_KEY) {
            keys = [import.meta.env.VITE_GEMINI_API_KEY];
         }
      } catch (e) {
         // ignore
      }
    }
  }

  if (keys.length === 0) {
    console.warn("No GEMINI_API_KEY or GEMINI_API_KEYS provided in environment or settings. Requests will likely fail.");
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Generate structured JSON content using Gemini
 */
export async function generateContentObj(prompt: string, schema: any, customApiKey?: string, retries = 3): Promise<any> {
  const apiKey = getRotatedApiKey(customApiKey);
  if (!apiKey) throw new Error("API Key tidak ditemukan. Silakan masukkan Gemini API Key di menu Pengaturan (ikon Settings).");
  
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
  if (!apiKey) throw new Error("API Key tidak ditemukan. Silakan masukkan Gemini API Key di menu Pengaturan (ikon Settings).");
  
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
