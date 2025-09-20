/*!
 * Copyright 2025 Cognite AS
 */
import { generateCanvasFingerprint } from './generateCanvasFingerprint';
import { generateAudioFingerprint } from './generateAudioFingerprint';
import { hashFingerprint } from './hashFingerprint';
import { GlobalDependencies } from '../types';

export async function getUserFingerprint(dependencies: Partial<GlobalDependencies> = {}): Promise<string> {
  const { document = window.document, OfflineAudioContext = window.OfflineAudioContext } = dependencies;

  try {
    if (!OfflineAudioContext) {
      throw new Error('OfflineAudioContext is not supported.');
    }

    const canvasFingerprint = generateCanvasFingerprint(document as Document);
    const audioFingerprint = await generateAudioFingerprint(OfflineAudioContext as typeof window.OfflineAudioContext);

    const combinedFP = `${canvasFingerprint}-${audioFingerprint}`;

    // Hash the combined string to get the final unique ID
    const fingerprintID = hashFingerprint(combinedFP).toString();

    return fingerprintID;
  } catch (error) {
    console.warn('Could not get browser fingerprint:', error);
    return 'unknown';
  }
}
