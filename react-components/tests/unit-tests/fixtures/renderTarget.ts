import { Mock } from 'moq.ts';
import { CommandsController, RevealRenderTarget, RootDomainObject } from '../../../src/architecture';
import { CdfCaches } from '../../../src/architecture/base/renderTarget/CdfCaches';
import { fdmNodeCacheContentMock } from './fdmNodeCache';
import { sdkMock } from './sdk';
import { vi } from 'vitest';

const cdfCachesMock = new Mock<CdfCaches>()
  .setup((p) => p.fdmNodeCache)
  .returns(fdmNodeCacheContentMock)
  .object();

const commandsControllerMock = new Mock<CommandsController>()
  .setup((p) => p.update)
  .returns(vi.fn())
  .setup((p) => p.addEventListeners)
  .returns(vi.fn())
  .setup((p) => p.removeEventListeners)
  .returns(vi.fn())
  .setup((p) => p.dispose)
  .returns(vi.fn())
  .object();

const rootDomainObjectMock = new RootDomainObject({} as RevealRenderTarget, sdkMock);

export const renderTargetMock = new Mock<RevealRenderTarget>()
  .setup((p) => p.cdfCaches)
  .returns(cdfCachesMock)
  .setup((p) => p.commandsController)
  .returns(commandsControllerMock)
  .setup((p) => p.rootDomainObject)
  .returns(rootDomainObjectMock)
  .object();
