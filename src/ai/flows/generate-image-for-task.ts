
'use server';
/**
 * @fileOverview An AI flow to generate an image for a task based on its description.
 *
 * - generateImageForTask - A function that generates an image for a task.
 * - GenerateImageForTaskInput - The input type for the generateImageForTask function.
 * - GenerateImageForTaskOutput - The return type for the generateImageForTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageForTaskInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to generate an image for.'),
});
export type GenerateImageForTaskInput = z.infer<typeof GenerateImageForTaskInputSchema>;

const GenerateImageForTaskOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageForTaskOutput = z.infer<typeof GenerateImageForTaskOutputSchema>;

export async function generateImageForTask(input: GenerateImageForTaskInput): Promise<GenerateImageForTaskOutput> {
  return generateImageForTaskFlow(input);
}

const generateImageForTaskFlow = ai.defineFlow(
  {
    name: 'generateImageForTaskFlow',
    inputSchema: GenerateImageForTaskInputSchema,
    outputSchema: GenerateImageForTaskOutputSchema,
  },
  async ({ taskDescription }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate an image that visually represents the following task: ${taskDescription}. The image should be inspiring and abstract.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error("Image generation failed to return an image.");
    }
    
    return {
      imageDataUri: media.url,
    };
  }
);
