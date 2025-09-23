/*!
 * Copyright 2025 Cognite AS
 */

import { PartialOfflineAudioContext, RequiredDynamicsCompressorNode, RequiredOfflineAudioContext } from './types';

export async function generateAudioFingerprint(OfflineAudioContextCtor: PartialOfflineAudioContext): Promise<string> {
  try {
    const context = new OfflineAudioContextCtor(1, 44100, 44100);

    const currentTime = context.currentTime;

    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, currentTime);

    // Each call contributes to uniqunes of fingerprint
    const compressor = context.createDynamicsCompressor();

    setCompressorValueIfDefined(compressor, context, 'threshold', -50);
    setCompressorValueIfDefined(compressor, context, 'knee', 40);
    setCompressorValueIfDefined(compressor, context, 'ratio', 12);
    setCompressorValueIfDefined(compressor, context, 'attack', 0);
    setCompressorValueIfDefined(compressor, context, 'release', 0.25);

    oscillator.connect(compressor);
    compressor.connect(context.destination);

    oscillator.start(0);

    const renderedBuffer = await context.startRendering();

    let output = 0;
    // Sum the absolute values of a stable section of the audio buffer.
    // This skips the unstable "transient" at the beginning of the signal.
    for (let i = 4500; i < 5000; i++) {
      const channelData = renderedBuffer.getChannelData(0)[i];
      output += Math.abs(channelData);
    }
    const fingerprint = output.toString();

    return fingerprint;
  } catch (error) {
    if (error) {
      throw error;
    }
    throw new Error('Unknown error during audio fingerprinting.');
  }
}

function setCompressorValueIfDefined(
  compressor: RequiredDynamicsCompressorNode,
  context: RequiredOfflineAudioContext,
  item: keyof Omit<RequiredDynamicsCompressorNode, 'connect'>,
  value: number
): void {
  const param = compressor[item];
  param.setValueAtTime(value, context.currentTime);
}
