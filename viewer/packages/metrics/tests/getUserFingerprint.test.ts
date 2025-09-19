/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';

import { getUserFingerprint } from '../src/Fingerprint/getUserFingerprint';
import { createMockDocument, createMockOfflineAudioContext } from '../../../test-utilities/mocks/fingerprintMocks';
import { MockedDocument } from '../src/types';

describe('Browser Fingerprint', () => {
  it('returns string with up to 20 digits in it (FingerprintID)', async () => {
    const mockDocument = createMockDocument();
    const MockOfflineAudioContext = createMockOfflineAudioContext(true);

    const result = await getUserFingerprint({
      document: mockDocument as MockedDocument,
      OfflineAudioContext: MockOfflineAudioContext
    });

    expect(result).not.toBe('unknown');
    expect(typeof result).toBe('string');
    expect(result.length).toBeLessThanOrEqual(20);
    expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
  });

  it('returns "unknown" if the Error has occured', async () => {
    const mockDocument = createMockDocument();
    const MockOfflineAudioContext = createMockOfflineAudioContext(false);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getUserFingerprint({
      document: mockDocument as MockedDocument,
      OfflineAudioContext: MockOfflineAudioContext
    });

    expect(result).toBe('unknown');
    expect(warnSpy).toHaveBeenCalledWith('Could not get browser fingerprint:', expect.any(Error));

    warnSpy.mockRestore();
  });

  it('returns "unknown" if OfflineAudioContext is not supported', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getUserFingerprint({
      OfflineAudioContext: undefined
    });

    expect(result).toBe('unknown');
    expect(warnSpy).toHaveBeenCalledWith(
      'Could not get browser fingerprint:',
      new Error('OfflineAudioContext is not supported.')
    );

    warnSpy.mockRestore();
  });
});
