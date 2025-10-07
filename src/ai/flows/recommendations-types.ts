
'use client'; // This file can be used by client components, so it's good practice.

/**
 * @fileOverview Type and schema definitions for the recommendations flow.
 *
 * - RecommendationsInputSchema - Zod schema for the input of the getRecommendations function.
 * - RecommendationsInput - The TypeScript type for the input.
 * - RecommendationsOutputSchema - Zod schema for the output of the getRecommendations function.
 * - RecommendationsOutput - The TypeScript type for the output.
 */

import { z } from 'zod';
import { movieGenres } from '@/lib/movieGenres';
import { tvGenres } from '@/lib/tvGenres';

const allGenres = [...new Set([...movieGenres.map(g => g.name), ...tvGenres.map(g => g.name)])];

export const RecommendationsInputSchema = z.object({
  watchHistory: z.array(z.string()).describe('A list of movie or TV show titles the user has watched.'),
  myList: z.array(z.string()).describe("A list of movie or TV show titles the user has added to their 'My List'."),
  favoriteGenre: z.string().optional().describe('The user\'s self-declared favorite genre.'),
});
export type RecommendationsInput = z.infer<typeof RecommendationsInputSchema>;


const RecommendationCategorySchema = z.object({
    title: z.string().describe('The user-visible title for the movie row (e.g., "Because You Watched Inception", "Dark Comedies").'),
    category: z.object({
        type: z.enum(['genre', 'trending', 'popular_movies', 'popular_tv', 'search']).describe("The type of category to fetch."),
        value: z.string().describe("The value for the category (e.g., genre name, search query). For 'trending', 'popular_movies', and 'popular_tv', this can be an empty string."),
    }).describe('The category information used to fetch the movies for this row.'),
});


export const RecommendationsOutputSchema = z.object({
    categories: z.array(RecommendationCategorySchema)
});
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;
