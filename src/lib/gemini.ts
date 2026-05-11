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
export function getAvailableApiKeys(customApiKeys?: string[] | string): string[] {
  let keys: string[] = [];
  if (Array.isArray(customApiKeys) && customApiKeys.length > 0) {
    keys = [...customApiKeys];
  } else if (typeof customApiKeys === 'string' && customApiKeys.trim() !== '') {
    keys = [customApiKeys];
  }

  if (keys.length === 0) {
    let envKeysString = undefined;
    try {
      envKeysString = import.meta.env?.VITE_GEMINI_API_KEYS;
    } catch (e) {
      // Ignore
    }
    
    // Safely check for process environment (for Node.js compatibility if needed later)
    try {
      if (!envKeysString && typeof process !== 'undefined' && process.env) {
        envKeysString = process.env?.GEMINI_API_KEYS;
      }
    } catch(e) {}

    if (envKeysString && envKeysString.trim() !== '') {
      keys = envKeysString.split(',').map((k: string) => k.trim()).filter((k: string) => k);
    }
  }
  
  if (keys.length === 0) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env?.GEMINI_API_KEY) {
        keys = [process.env.GEMINI_API_KEY];
      }
    } catch(e) {}
    if (keys.length === 0) {
      try {
         if (import.meta.env?.VITE_GEMINI_API_KEY) {
            keys = [import.meta.env.VITE_GEMINI_API_KEY];
         }
      } catch (e) {
         // ignore
      }
    }
  }

  return keys;
}

/**
 * Generate structured JSON content using Gemini
 */
export async function generateContentObj(prompt: string, schema: any, customApiKeys?: string[] | string): Promise<any> {
  const availableKeys = getAvailableApiKeys(customApiKeys);
  
  if (availableKeys.length === 0) {
    throw new Error("API Key tidak ditemukan. Silakan masukkan Gemini API Key di menu Pengaturan (ikon Settings) dan simpan ke database.");
  }

  // Shuffle keys to try random ones
  const keysToTry = [...availableKeys].sort(() => Math.random() - 0.5);
  let lastError: any = null;

  for (let i = 0; i < keysToTry.length; i++) {
    const apiKey = keysToTry[i];
    // Maximum 2 attempts per key
    for (let attempt = 1; attempt <= 2; attempt++) {
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
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt} for key failed:`, error.message);
        // If it's an API permission or leak error, don't retry same key
        if (error.message?.includes("403") || error.message?.includes("PERMISSION_DENIED") || error.message?.includes("leaked")) {
          break; // move to next key
        }
        // If generic error, maybe retry this key
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
  }
  
  console.error("All keys exhausted or failed generating JSON content");
  throw lastError || new Error("Gagal generate konten dengan semua API key yang tersedia.");
}

/**
 * Generate standard text/markdown content using Gemini
 */
export async function generateContentText(prompt: string, customApiKeys?: string[] | string): Promise<string | undefined> {
  const availableKeys = getAvailableApiKeys(customApiKeys);
  
  if (availableKeys.length === 0) {
    throw new Error("API Key tidak ditemukan. Silakan masukkan Gemini API Key di menu Pengaturan (ikon Settings) dan simpan ke database.");
  }

  // Shuffle keys to try random ones
  const keysToTry = [...availableKeys].sort(() => Math.random() - 0.5);
  let lastError: any = null;

  for (let i = 0; i < keysToTry.length; i++) {
    const apiKey = keysToTry[i];
    // Maximum 2 attempts per key
    for (let attempt = 1; attempt <= 2; attempt++) {
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
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt} for key failed:`, error.message);
        // If it's an API permission or leak error, don't retry same key
        if (error.message?.includes("403") || error.message?.includes("PERMISSION_DENIED") || error.message?.includes("leaked")) {
          break; // move to next key
        }
        // If it's 429 quota, also maybe just go to next key
        if (error.message?.includes("429")) {
          break; // move to next key
        }
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
  }

  console.error("All keys exhausted or failed generating text content");
  throw lastError || new Error("Gagal generate konten dengan semua API key yang tersedia.");
}
