import { RecommendationsInput, RecommendationsOutput, RecommendationsOutputSchema } from '@/ai/flows/recommendations-types';

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  // Do not throw at import time in case code is evaluated in clients — only warn.
  // The calling code should handle missing key where appropriate.
  console.warn('Warning: OPENAI_API_KEY is not set. ChatGPT requests will fail until it is provided in env.');
}

function extractJson(text: string) {
  // Try to find a JSON object in the model response
  const firstIdx = text.indexOf('{');
  const lastIdx = text.lastIndexOf('}');
  if (firstIdx === -1 || lastIdx === -1 || lastIdx <= firstIdx) return null;
  const jsonStr = text.slice(firstIdx, lastIdx + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

export async function requestRecommendationsFromChatGPT(input: RecommendationsInput): Promise<RecommendationsOutput> {
  if (!OPENAI_KEY) {
    console.error('OPENAI_API_KEY missing');
    return { recommendations: [] } as RecommendationsOutput;
  }

  const system = `You are a movie/TV recommendation engine assistant. Given a user's watch history, their My List and their favorite genre, produce a JSON object that matches this TypeScript schema: { recommendations: [{ title: string, category: { type: 'genre' | 'trending' | 'popular_movies' | 'popular_tv' | 'search', value: string } }] }. The 'value' should be a valid genre name when type is 'genre', or a short search query when type is 'search'. Only return the JSON object and nothing else.`;

  const user = `User Watch History:\n${(input.watchHistory || []).map((s) => `- ${s}`).join('\n') || 'None'}\n\nUser My List:\n${(input.myList || []).map((s) => `- ${s}`).join('\n') || 'None'}\n\nFavorite Genre: ${input.favoriteGenre || 'None'}\n\nGenerate 10-15 recommendation rows. Include 'Trending Now', 'Popular Movies', and 'Popular TV Shows' at least once, and prefer shorter genre values (e.g. Action, Drama) when using type=genre.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('OpenAI error', res.status, body);
      return { recommendations: [] } as RecommendationsOutput;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    let parsed = extractJson(content);
    if (!parsed) {
      // fallback: try to parse the entire content directly
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        console.error('Failed to parse model output as JSON', err, content);
        return { recommendations: [] } as RecommendationsOutput;
      }
    }

    try {
      const validated = RecommendationsOutputSchema.parse(parsed);
      return validated as RecommendationsOutput;
    } catch (err) {
      console.error('Validation failed for recommendation output', err, parsed);
      return { recommendations: [] } as RecommendationsOutput;
    }
  } catch (err) {
    console.error('Error requesting OpenAI:', err);
    return { recommendations: [] } as RecommendationsOutput;
  }
}

export default requestRecommendationsFromChatGPT;
