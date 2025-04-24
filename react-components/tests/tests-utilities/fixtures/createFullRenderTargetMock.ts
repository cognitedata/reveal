import { RevealRenderTarget } from '../../../src/architecture';
import { sdkMock } from './sdk';
import { createViewerMock } from './viewer';

export function createFullRenderTargetMock(): RevealRenderTarget {
  const renderTarget = new RevealRenderTarget(createViewerMock(), sdkMock);
  return renderTarget;
}
