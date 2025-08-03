'use server';
/**
 * @fileOverview A task completion motivation AI agent.
 *
 * - motivateTaskCompletion - A function that generates a motivational message upon task completion.
 * - MotivateTaskCompletionInput - The input type for the motivateTaskCompletion function.
 * - MotivateTaskCompletionOutput - The return type for the motivateTaskCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivateTaskCompletionInputSchema = z.object({
  taskName: z.string().describe('The name of the completed task.'),
  taskDescription: z.string().describe('The description of the completed task.'),
});
export type MotivateTaskCompletionInput = z.infer<typeof MotivateTaskCompletionInputSchema>;

const MotivateTaskCompletionOutputSchema = z.object({
  motivationalMessage: z.string().describe('A motivational message to encourage the user.'),
});
export type MotivateTaskCompletionOutput = z.infer<typeof MotivateTaskCompletionOutputSchema>;

export async function motivateTaskCompletion(input: MotivateTaskCompletionInput): Promise<MotivateTaskCompletionOutput> {
  return motivateTaskCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivateTaskCompletionPrompt',
  input: {schema: MotivateTaskCompletionInputSchema},
  output: {schema: MotivateTaskCompletionOutputSchema},
  prompt: `You are a motivational assistant. Generate a short motivational message to encourage the user after completing a task.

Task Name: {{{taskName}}}
Task Description: {{{taskDescription}}}

Motivational Message:`,
});

const motivateTaskCompletionFlow = ai.defineFlow(
  {
    name: 'motivateTaskCompletionFlow',
    inputSchema: MotivateTaskCompletionInputSchema,
    outputSchema: MotivateTaskCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
