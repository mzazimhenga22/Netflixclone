// File: src/ai/flows/recommendations-flow.ts
 'use server';

import requestRecommendationsFromChatGPT from '@/ai/chatgpt';
import { movieGenres } from '@/lib/movieGenres';
import { tvGenres } from '@/lib/tvGenres';

import type {
  RecommendationsInput,
  RecommendationsOutput,
  RecommendationCategory
} from './recommendations-types';
import {
  RecommendationsInputSchema,
  RecommendationsOutputSchema
} from './recommendations-types';

// All genres combined for validation and prompt
const allGenres = [...new Set([...movieGenres.map(g => g.name), ...tvGenres.map(g => g.name)])];

// We now use ChatGPT directly for recommendations. The helper
// `requestRecommendationsFromChatGPT` lives in `src/ai/chatgpt.ts` and
// returns a validated `RecommendationsOutput`.

async function getRecommendationsFlowHandler(input: RecommendationsInput) {
  const output = await requestRecommendationsFromChatGPT(input);
  if (!output || !Array.isArray(output.recommendations)) {
    return { recommendations: [] } as RecommendationsOutput;
  }
  return output as RecommendationsOutput;
}

// Typed wrapper for safe consumption
export async function getRecommendations(
  input: RecommendationsInput
): Promise<RecommendationCategory[]> {
  try {
    const output = (await getRecommendationsFlowHandler(input)) as RecommendationsOutput | undefined;
    return output?.recommendations ?? [];
  } catch (err) {
    console.error('getRecommendations failed:', err);
    return [];
  }
}
