const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${error}`);
  }

  const data = (await response.json()) as GeminiResponse;

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini returned no response');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function translateToSpanish(texts: string[]): Promise<string[]> {
  const prompt = `Translate the following CV experience bullets from English to natural, professional Spanish. Keep technical terms (React, Next.js, TypeScript, etc.) in English. Use past tense for completed roles. Return ONLY a JSON array of translated strings, nothing else.

${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    return texts;
  }

  const data = (await response.json()) as GeminiResponse;
  if (!data.candidates || data.candidates.length === 0) return texts;

  let cleaned = data.candidates[0].content.parts[0].text.trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (jsonMatch) cleaned = jsonMatch[0];
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as string[];
    if (Array.isArray(parsed) && parsed.length === texts.length) {
      return parsed;
    }
  } catch {}

  return texts;
}
