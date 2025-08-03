'use server';

/**
 * @fileOverview An AI agent to prioritize tasks based on deadlines, importance, and descriptions.
 *
 * - prioritizeTasks - A function that prioritizes tasks.
 * - Task - The type definition for a task.
 * - PrioritizedTasksOutput - The output type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  name: z.string().describe('The name of the task.'),
  description: z.string().describe('A detailed description of the task.'),
  deadline: z.string().describe('The deadline for the task (ISO format).'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('The priority of the task.'),
});

export type Task = z.infer<typeof TaskSchema>;

const PrioritizedTasksOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the task.'),
    priorityScore: z.number().describe('A numerical score representing the priority of the task.'),
    reasoning: z.string().describe('The AI reasoning for the assigned priority score.'),
  })
);

export type PrioritizedTasksOutput = z.infer<typeof PrioritizedTasksOutputSchema>;

const PrioritizeTasksInputSchema = z.array(TaskSchema);
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

export async function prioritizeTasks(tasks: PrioritizeTasksInput): Promise<PrioritizedTasksOutput> {
  return prioritizeTasksFlow(tasks);
}

const taskPrioritizationPrompt = ai.definePrompt({
  name: 'taskPrioritizationPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizedTasksOutputSchema},
  prompt: `You are an AI assistant designed to prioritize a list of tasks based on their deadlines, importance, and descriptions. Your goal is to help the user focus on the most critical items first.

Analyze each task and assign a priority score based on the following criteria:

- **Deadline:** Tasks with closer deadlines should have higher priority.
- **Importance:** Tasks marked as 'High' priority should have higher priority.
- **Description:** Consider the task description to understand the potential impact of not completing the task.

Provide a brief reasoning for each assigned priority score.

Tasks:
{{#each this}}
- Name: {{name}}
  Description: {{description}}
  Deadline: {{deadline}}
  Priority: {{priority}}
{{/each}}

Output the prioritized tasks with their priority scores and reasoning in a JSON array format:
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizedTasksOutputSchema,
  },
  async tasks => {
    const {output} = await taskPrioritizationPrompt(tasks);
    return output!;
  }
);
