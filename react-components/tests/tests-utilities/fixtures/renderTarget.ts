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
  .setup((p) => p.fdmCadNodeCache)
  .returns(fdmNodeCacheContentMock)
  .object();

const commandsControllerMock = new Mock<CommandsController>()
  .setup((p) => p.deferredUpdate)
  .returns(vi.fn())
  .setup((p) => p.addEventListeners)
  .returns(vi.fn())
  .setup((p) => p.removeEventListeners)
  .returns(vi.fn())
  .setup((p) => p.dispose)
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
    .setup((p) => p.updateAllCommands)
    .returns(vi.fn())
    .setup((p) => p.revealSettingsController)
    .returns(new RevealSettingsController(viewerMock));

  const root = new RootDomainObject(mock.object(), sdkMock);
  mock.setup((p) => p.root).returns(root);
  return mock.object();
}
