'use server';
/**
 * @fileOverview A flow to process user feedback and suggestions.
 *
 * - processUserFeedback - A function that handles user feedback.
 * - ProcessUserFeedbackInput - The input type for the processUserFeedback function.
 * - ProcessUserFeedbackOutput - The return type for the processUserFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessUserFeedbackInputSchema = z.object({
  feedback: z.string().describe('The user’s feedback or suggestion for the app.'),
  language: z.string().describe('The language the user is using in the app (e.g., "english", "hinglish").'),
});
export type ProcessUserFeedbackInput = z.infer<typeof ProcessUserFeedbackInputSchema>;

const ProcessUserFeedbackOutputSchema = z.object({
  responseMessage: z.string().describe('A friendly and encouraging response to the user.'),
});
export type ProcessUserFeedbackOutput = z.infer<typeof ProcessUserFeedbackOutputSchema>;

export async function processUserFeedback(input: ProcessUserFeedbackInput): Promise<ProcessUserFeedbackOutput> {
  return processUserFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processUserFeedbackPrompt',
  input: {schema: ProcessUserFeedbackInputSchema},
  output: {schema: ProcessUserFeedbackOutputSchema},
  prompt: `You are the friendly product manager for the "Tranquil Task" app. A user is submitting feedback. Your job is to provide a short, encouraging, and appreciative response in the same language as their feedback.

User's Language: {{{language}}}
User's Feedback: "{{{feedback}}}"

Generate a response that:
1. Thanks the user for their suggestion.
2. Acknowledges their idea.
3. Lets them know you'll consider it for future updates.

Keep the response warm and personal. Do not ask for more information.
`,
});

const processUserFeedbackFlow = ai.defineFlow(
  {
    name: 'processUserFeedbackFlow',
    inputSchema: ProcessUserFeedbackInputSchema,
    outputSchema: ProcessUserFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
