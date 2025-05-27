// src/ai/flows/smart-extract.ts
'use server';
/**
 * @fileOverview Smart Extract AI tool that automatically identifies and extracts relevant information from a webpage.
 *
 * - smartExtract - A function that handles the smart extraction process.
 * - SmartExtractInput - The input type for the smartExtract function.
 * - SmartExtractOutput - The return type for the smartExtract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartExtractInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to extract data from.'),
});
export type SmartExtractInput = z.infer<typeof SmartExtractInputSchema>;

const SmartExtractOutputSchema = z.object({
  extractedData: z.string().describe('The extracted data from the webpage.'),
});
export type SmartExtractOutput = z.infer<typeof SmartExtractOutputSchema>;

export async function smartExtract(input: SmartExtractInput): Promise<SmartExtractOutput> {
  return smartExtractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartExtractPrompt',
  input: {schema: SmartExtractInputSchema},
  output: {schema: SmartExtractOutputSchema},
  prompt: `You are an AI web scraper. You will extract the most relevant information from the webpage provided in the URL.

  URL: {{{url}}}

  Return the extracted data in a single string.
  `,
});

const smartExtractFlow = ai.defineFlow(
  {
    name: 'smartExtractFlow',
    inputSchema: SmartExtractInputSchema,
    outputSchema: SmartExtractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
