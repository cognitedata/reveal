/*!
 * Copyright 2023 Cognite AS
 */
import { getCurrentBrowserFingerPrint } from '@rajesh896/broprint.js';

/**
 * Returns a fingerprint based on the current browser. This is can be used to
 * distinguish between different users. However, it is not 100% reliable,
 * and can produce duplicates for distinct users.
 *
 * See https://broprintjs.netlify.app/
 */
export async function getUserFingerprint(): Promise<string> {
  try {
    return getCurrentBrowserFingerPrint();
  } catch (error) {
    console.warn('Could not get browser fingerprint:', error);
    return 'unknown';
  }
}
