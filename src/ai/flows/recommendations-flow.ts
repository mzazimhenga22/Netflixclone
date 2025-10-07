
'use server';

/**
 * @fileOverview A flow for generating personalized movie and TV show recommendations.
 *
 * - getRecommendations - A function that handles the recommendation process.
 * - RecommendationsInput - The input type for the getRecommendations function.
 * - RecommendationsOutput - The return type for the getRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { movieGenres } from '@/lib/movieGenres';
import { tvGenres } from '@/lib/tvGenres';

const allGenres = [...new Set([...movieGenres.map(g => g.name), ...tvGenres.map(g => g.name)])];

export const RecommendationsInputSchema = z.object({
  watchHistory: z.array(z.string()).describe('A list of movie or TV show titles the user has watched.'),
  myList: z.array(z.string()).describe("A list of movie or TV show titles the user has added to their 'My List'."),
  favoriteGenre: z.string().optional().describe('The user\'s self-declared favorite genre.'),
});
export type RecommendationsInput = z.infer<typeof RecommendationsInputSchema>;

const CategorySchema = z.object({
    type: z.enum(['genre', 'trending', 'popular_movies', 'popular_tv', 'search']).describe("The type of category to fetch."),
    value: z.string().describe("The value for the category (e.g., genre name, search query). For 'trending', 'popular_movies', and 'popular_tv', this can be an empty string."),
});

export const RecommendationsOutputSchema = z.array(z.object({
  title: z.string().describe('The user-visible title for the movie row (e.g., "Because You Watched Inception", "Dark Comedies").'),
  category: CategorySchema.describe('The category information used to fetch the movies for this row.'),
}));
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;


const recommendationPrompt = ai.definePrompt({
    name: 'recommendationPrompt',
    input: { schema: RecommendationsInputSchema },
    output: { schema: RecommendationsOutputSchema },
    prompt: `You are a Netflix-style recommendation engine. Your task is to create a personalized and engaging browsing experience for a user based on their watch history, their "My List", and their favorite genre.

    Generate a list of 10-15 row titles and the corresponding categories to fetch the content. The output should be a shuffled list that feels fresh and interesting.

    RULES:
    1.  **Be Creative with Titles:** Instead of just "Action", use titles like "Adrenaline-Pumping Action Hits" or "Because you watched Die Hard".
    2.  **Mix and Match:** Combine standard genres with recommendations based on specific items from the user's history and list.
    3.  **Prioritize User Data:** The recommendations should be heavily influenced by the 'watchHistory', 'myList', and 'favoriteGenre' inputs.
    4.  **Include Core Categories:** Always include "Trending Now", "Popular Movies", and "Popular TV Shows".
    5.  **Use Valid Genres:** For 'genre' type categories, you MUST use a value from this list: ${allGenres.join(', ')}.
    6.  **Use Search for Specific Themes:** For very specific themes not covered by genres (e.g., "Movies about Space Travel"), use the 'search' type.
    7.  **Shuffle the Output:** The final array of categories should be in a varied, non-predictable order, but "Trending Now" should usually be near the top.

    User's Watch History:
    {{#if watchHistory}}
    {{#each watchHistory}}- {{this}}
    {{/each}}
    {{else}}None{{/if}}

    User's My List:
    {{#if myList}}
    {{#each myList}}- {{this}}
    {{/each}}
    {{else}}None{{/if}}

    User's Favorite Genre: {{favoriteGenre}}

    Generate the personalized list of categories now.`,
});


export const getRecommendationsFlow = ai.defineFlow(
    {
        name: 'getRecommendationsFlow',
        inputSchema: RecommendationsInputSchema,
        outputSchema: RecommendationsOutputSchema,
    },
    async (input) => {
        const { output } = await recommendationPrompt(input);
        return output || [];
    }
);

export async function getRecommendations(input: RecommendationsInput): Promise<RecommendationsOutput> {
    return getRecommendationsFlow(input);
}
