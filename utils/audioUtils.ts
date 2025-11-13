// utils/audioUtils.ts
/**
 * Decodes raw PCM audio data (Uint8Array) into an AudioBuffer.
 * This is specific for raw PCM data and not for standard audio file formats.
 * @param data The Uint8Array containing raw PCM audio data.
 * @param ctx The AudioContext to create the AudioBuffer in.
 * @param sampleRate The sample rate of the audio data.
 * @param numChannels The number of channels (e.g., 1 for mono, 2 for stereo).
 * @returns A Promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert int16 to float32, normalizing to [-1, 1]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Creates a Blob from a Float32Array (e.g., from AudioBuffer getChannelData).
 * This is useful for sending microphone data as PCM.
 * @param data The Float32Array audio data.
 * @returns A Blob object.
 */
export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768; // Convert float32 to int16
  }
  return new Blob([int16], { type: 'audio/pcm;rate=16000' });
}
