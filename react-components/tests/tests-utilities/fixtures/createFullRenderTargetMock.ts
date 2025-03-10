import { RevealRenderTarget } from '../../../src/architecture';
import { sdkMock } from './sdk';
import { viewerMock } from './viewer';

export function createFullRenderTargetMock(): RevealRenderTarget {
  const renderTarget = new RevealRenderTarget(viewerMock, sdkMock);
  return renderTarget;
}
