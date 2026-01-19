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
import { channels } from '@/lib/data';

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
    const channel = channels.find(c => c.name.toLowerCase() === input.channelName.toLowerCase());

    if (channel) {
      return {
        channelName: channel.name,
        category: channel.category,
        description: `A TV channel in the ${channel.category} category.`,
      };
    }
    
    // This is a placeholder implementation for channels not in our static data.
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
  prompt: `You are a TV channel recommendation expert. Based on the user's viewing history, you will recommend other channels they might enjoy. 
  
First, use the getChannelInfo tool for each channel in the user's viewing history to understand their preferences.

Then, from the following list of available channels, select a few that are a good match for the user's preferences. Do not recommend channels that are already in their viewing history.

Available channels: ${channels.map(c => c.name).join(', ')}

User's Viewing History:
{{#each viewingHistory}}
- {{this}}
{{/each}}
`,
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
