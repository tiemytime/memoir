const API_KEY_STORAGE_KEY = "geminiApiKey";
const MODEL = "gemini-flash-latest";

export async function getApiKey(): Promise<string> {
  const { [API_KEY_STORAGE_KEY]: key } = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
  return typeof key === "string" ? key : "";
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: key });
}

export interface GeminiExpansion {
  expansion: string;
  tags: string[];
}

interface CallGeminiParams {
  apiKey: string;
  notes: string;
  pageTitle: string;
  selectionText?: string;
}

const SYSTEM_PROMPT = `You are a learning companion inside a browser extension. The user is actively learning something and just wrote a few rough notes or keywords about it — often fragments, never full sentences. Your job is to expand their notes into a clear, useful explanation, grounded in the page they're on and any highlighted text. Build on what the user specifically wrote — do not just summarize the page.

Structure the expansion as markdown with these sections, skipping any that don't apply:
- **Beginner explanation** — plain-language, no assumed background
- **Technical explanation** — more precise/formal treatment
- **Example** — a concrete example or short snippet if relevant
- **Common mistakes** — pitfalls learners often hit
- **Related concepts** — 2-4 concepts this connects to, and how

Keep it concise and skimmable — this is a learning aid, not an essay.`;

export async function callGemini(params: CallGeminiParams): Promise<GeminiExpansion> {
  const { apiKey, notes, pageTitle, selectionText } = params;

  const prompt = `${SYSTEM_PROMPT}

Page title: ${pageTitle}
${selectionText ? `Highlighted text on the page: "${selectionText}"` : ""}

User's rough notes:
"""
${notes}
"""

Respond with JSON matching this exact shape:
{
  "expansion": "the full markdown expansion as a string",
  "tags": ["3-5 short lowercase concept tags"]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              expansion: { type: "STRING" },
              tags: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["expansion", "tags"],
          },
        },
      }),
    },
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content — try again.");

  let parsed: { expansion?: string; tags?: string[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned malformed output — try again.");
  }

  return {
    expansion: parsed.expansion ?? "",
    tags: (parsed.tags ?? [])
      .map((tag) => tag.toLowerCase().trim())
      .filter((tag) => tag.length > 0),
  };
}
