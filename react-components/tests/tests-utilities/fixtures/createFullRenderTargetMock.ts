import { RevealRenderTarget } from '../../../src/architecture';
import { sdkMock } from './sdk';
import { createViewerMock } from './viewer';

export function createFullRenderTargetMock(): RevealRenderTarget {
  return new RevealRenderTarget(createViewerMock(), sdkMock);
}
