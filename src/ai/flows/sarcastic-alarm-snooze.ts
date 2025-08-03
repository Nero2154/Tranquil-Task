'use server';
/**
 * @fileOverview A flow to generate a sarcastic joke when an alarm is snoozed.
 *
 * - sarcasticAlarmSnooze - A function that generates a sarcastic joke related to the alarm's description.
 * - SarcasticAlarmSnoozeInput - The input type for the sarcasticAlarmSnooze function.
 * - SarcasticAlarmSnoozeOutput - The return type for the sarcasticAlarmSnooze function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const SarcasticAlarmSnoozeInputSchema = z.object({
  alarmDescription: z.string().describe('The description of the alarm.'),
});
export type SarcasticAlarmSnoozeInput = z.infer<typeof SarcasticAlarmSnoozeInputSchema>;

const SarcasticAlarmSnoozeOutputSchema = z.object({
  audio: z.string().describe('The audio of the sarcastic joke in WAV format as a data URI.'),
});
export type SarcasticAlarmSnoozeOutput = z.infer<typeof SarcasticAlarmSnoozeOutputSchema>;

export async function sarcasticAlarmSnooze(input: SarcasticAlarmSnoozeInput): Promise<SarcasticAlarmSnoozeOutput> {
  return sarcasticAlarmSnoozeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sarcasticAlarmSnoozePrompt',
  input: {schema: SarcasticAlarmSnoozeInputSchema},
  prompt: `You are a sarcastic AI assistant. When the user snoozes an alarm, you generate a short, sarcastic joke related to the alarm's description to playfully discourage them from delaying tasks.

Alarm Description: {{{alarmDescription}}}

Joke:`,
});

const sarcasticAlarmSnoozeFlow = ai.defineFlow(
  {
    name: 'sarcasticAlarmSnoozeFlow',
    inputSchema: SarcasticAlarmSnoozeInputSchema,
    outputSchema: SarcasticAlarmSnoozeOutputSchema,
  },
  async input => {
    const {text} = await prompt(input);

    if (!text) {
        throw new Error("The AI didn't return a joke.");
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      audio: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
