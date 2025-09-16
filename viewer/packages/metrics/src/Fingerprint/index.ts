/*!
 * Copyright 2025 Cognite AS
 */
import { generateCanvasFingerprint } from './generateCanvasFingerprint';
import { generateAudioFingerprint } from './generateAudioFingerprint';
import { hashFingerprint } from './hashFingerprint';

export async function getUserFingerprint(): Promise<string> {
  try {
    const canvasFingerprint = generateCanvasFingerprint();
    const audioFingerprint = await generateAudioFingerprint();

    const combinedFP = `${canvasFingerprint}-${audioFingerprint}`;

    // Hash the combined string to get the final unique ID
    const fingerprintID = hashFingerprint(combinedFP).toString();

    return fingerprintID;
  } catch (error) {
    console.warn('Could not get browser fingerprint:', error);
    return 'unknown';
  }
}
