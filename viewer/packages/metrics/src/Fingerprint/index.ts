
import { generateCanvasFingerprint } from "./CanvasFingerprint";
import { generateAudioFingerprint } from "./AudioFingerprint";
import { hashFingerprint } from "./FingerprintHash";

/**
 * Returns a fingerprint based on the current browser. This is can be used to
 * distinguish between different users. However, it is not 100% reliable,
 * and can produce duplicates for distinct users.
 */

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
