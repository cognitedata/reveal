import { Mock } from 'moq.ts';
import {
  type CommandsController,
  type RevealRenderTarget,
  RootDomainObject
} from '../../../src/architecture';
import { type CdfCaches } from '../../../src/architecture/base/renderTarget/CdfCaches';
import { fdmNodeCacheContentMock } from './fdmNodeCache';
import { sdkMock } from './sdk';
import { vi } from 'vitest';
import { viewerMock } from './viewer';
import { RevealSettingsController } from '../../../src/architecture/concrete/reveal/RevealSettingsController';

const cdfCachesMock = new Mock<CdfCaches>()
  .setup((p) => p.fdmNodeCache)
  .returns(fdmNodeCacheContentMock)
  .object();

const commandsControllerMock = new Mock<CommandsController>()
  .setup((p) => p.update.bind(p))
  .returns(vi.fn())
  .setup((p) => p.addEventListeners.bind(p))
  .returns(vi.fn())
  .setup((p) => p.removeEventListeners.bind(p))
  .returns(vi.fn())
  .setup((p) => p.dispose.bind(p))
  .returns(vi.fn())
  .object();

export function createRenderTargetMock(): RevealRenderTarget {
  const mock = new Mock<RevealRenderTarget>()
    .setup((p) => p.viewer)
    .returns(viewerMock)
    .setup((p) => p.cdfCaches)
    .returns(cdfCachesMock)
    .setup((p) => p.commandsController)
    .returns(commandsControllerMock)
    .setup((p) => p.invalidate.bind(p))
    .returns(vi.fn())
    .setup((p) => p.revealSettingsController)
    .returns(new RevealSettingsController(viewerMock));

  const root = new RootDomainObject(mock.object(), sdkMock);
  mock.setup((p) => p.rootDomainObject).returns(root);
  return mock.object();
}
