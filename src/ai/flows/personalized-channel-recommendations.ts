'use server';

/**
 * @fileOverview Provides personalized channel recommendations based on user viewing history.
 *
 * - getPersonalizedChannelRecommendations - A function that returns personalized channel recommendations.
 * - PersonalizedChannelRecommendationsInput - The input type for the getPersonalizedChannelRecommendations function.
 * - PersonalizedChannelRecommendationsOutput - The return type for the getPersonalizedChannelRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedChannelRecommendationsInputSchema = z.object({
  viewingHistory: z.array(z.string()).describe('An array of channel names the user has previously watched.'),
});
export type PersonalizedChannelRecommendationsInput = z.infer<typeof PersonalizedChannelRecommendationsInputSchema>;

const PersonalizedChannelRecommendationsOutputSchema = z.object({
  recommendedChannels: z.array(z.string()).describe('An array of channel names recommended for the user.'),
});
export type PersonalizedChannelRecommendationsOutput = z.infer<typeof PersonalizedChannelRecommendationsOutputSchema>;

const getChannelInfo = ai.defineTool(
  {
    name: 'getChannelInfo',
    description: 'Retrieves information about a specific TV channel.',
    inputSchema: z.object({
      channelName: z.string().describe('The name of the channel to retrieve information about.'),
    }),
    outputSchema: z.object({
      channelName: z.string(),
      category: z.string(),
      description: z.string(),
    }),
  },
  async (input) => {
    // TODO: Implement the actual retrieval of channel information from a database or external source.
    // This is a placeholder implementation.
    return {
      channelName: input.channelName,
      category: 'Unknown',
      description: 'No description available.',
    };
  }
);

export async function getPersonalizedChannelRecommendations(input: PersonalizedChannelRecommendationsInput): Promise<PersonalizedChannelRecommendationsOutput> {
  return personalizedChannelRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedChannelRecommendationsPrompt',
  input: {schema: PersonalizedChannelRecommendationsInputSchema},
  output: {schema: PersonalizedChannelRecommendationsOutputSchema},
  tools: [getChannelInfo],
  prompt: `You are a TV channel recommendation expert. Based on the user's viewing history, you will recommend other channels they might enjoy. Consider the categories and descriptions of channels the user has watched, and suggest similar channels.\n\nUser's Viewing History: {{#each viewingHistory}}- {{this}}\n{{/each}}\n\nRecommended Channels:`,
});

const personalizedChannelRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedChannelRecommendationsFlow',
    inputSchema: PersonalizedChannelRecommendationsInputSchema,
    outputSchema: PersonalizedChannelRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
