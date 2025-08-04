
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

const SarcasticJokeListOutputSchema = z.object({
    jokes: z.array(z.string()).describe("A list of 5 short, sarcastic jokes.")
});

const prompt = ai.definePrompt({
  name: 'sarcasticAlarmSnoozePrompt',
  input: {schema: SarcasticAlarmSnoozeInputSchema},
  output: {schema: SarcasticJokeListOutputSchema},
  prompt: `You are a sarcastic AI assistant. When the user snoozes an alarm, you generate a list of 5 short, sarcastic jokes related to the alarm's description to playfully discourage them from delaying tasks. The jokes should be distinct from each other.

Alarm Description: {{{alarmDescription}}}

Jokes:`,
});

const sarcasticAlarmSnoozeFlow = ai.defineFlow(
  {
    name: 'sarcasticAlarmSnoozeFlow',
    inputSchema: SarcasticAlarmSnoozeInputSchema,
    outputSchema: SarcasticAlarmSnoozeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const jokes = output?.jokes;

    if (!jokes || jokes.length === 0) {
        throw new Error("The AI didn't return any jokes.");
    }

    const fullJokeText = jokes.join(" ");

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
      prompt: fullJokeText,
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
