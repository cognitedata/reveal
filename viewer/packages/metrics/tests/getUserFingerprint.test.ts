import { jest } from '@jest/globals';

import {
  getUserFingerprint,
} from '../src/Fingerprint/getUserFingerprint';
import { setupCanvasMock } from './mocks/setupCanvasMock';
import { setupAudioMock } from './mocks/setupAudioMock';



beforeEach(() => {
  jest.clearAllMocks();
  global.window = {} as unknown as Window & typeof globalThis;
  global.document = {} as unknown as Document;
});

describe('Browser Fingerprint', () => {
  it('returns string with up to 20 digits in it (FingerprintID)', async () => {
    setupCanvasMock();
    setupAudioMock(true);

    const result = await getUserFingerprint();

    expect(result).not.toBe('unknown');
    expect(typeof result).toBe('string');
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('returns "unknown" if the Error has occured', async () => {
    setupCanvasMock();
    setupAudioMock(false); 

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getUserFingerprint();

    expect(result).toBe('unknown');

    warnSpy.mockRestore();
  });

});