/*!
 * Copyright 2021 Cognite AS
 */

import { RevealParserWorker } from '@cognite/reveal-parser-worker';
import { checkWorkerVersion } from './WorkerPool';

const createWorkerWithVersion = (version: string) => {
  return ({
    async getVersion() {
      return version;
    }
  } as any) as RevealParserWorker;
};

describe('WorkerPool test cases', () => {
  it('throws if parser-worker MAJOR version mismatches with required', async () => {
    global.process.env.WORKER_VERSION = '1.2.3';

    const majorMismatch1 = createWorkerWithVersion('0.2.3');
    const majorMismatch2 = createWorkerWithVersion('2.2.3');

    await expect(checkWorkerVersion(majorMismatch1)).rejects.toThrow();
    await expect(checkWorkerVersion(majorMismatch2)).rejects.toThrow();
  });

  it('throws if parser-worker MINOR version is lower than required', async () => {
    global.process.env.WORKER_VERSION = '1.2.3';

    const lowerMinor = createWorkerWithVersion('1.1.3');
    await expect(checkWorkerVersion(lowerMinor)).rejects.toThrow();

    const higherMinor = createWorkerWithVersion('1.3.0');
    await expect(checkWorkerVersion(higherMinor)).resolves.toBeUndefined();
  });

  it('throws if parser-worker PATCH version is lower than required', async () => {
    global.process.env.WORKER_VERSION = '1.2.3';

    const lowerPatch = createWorkerWithVersion('1.2.0');
    await expect(checkWorkerVersion(lowerPatch)).rejects.toThrow();

    const higherPatch = createWorkerWithVersion('1.2.5');
    const fullMatch = createWorkerWithVersion(global.process.env.WORKER_VERSION);

    await expect(checkWorkerVersion(higherPatch)).resolves.toBeUndefined();
    await expect(checkWorkerVersion(fullMatch)).resolves.toBeUndefined();
  });

  it('handles older parser-worker versions without getVersion method', async () => {
    // older versions without getVersion equal to 1.1.0 version

    global.process.env.WORKER_VERSION = '1.1.0';
    await expect(checkWorkerVersion({} as RevealParserWorker)).resolves.toBeUndefined();

    global.process.env.WORKER_VERSION = '1.2.3';
    await expect(checkWorkerVersion({} as RevealParserWorker)).rejects.toThrow();
  });
});
