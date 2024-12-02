import { Mock } from 'moq.ts';
import { RevealRenderTarget } from '../../../src/architecture';
import { CdfCaches } from '../../../src/architecture/base/renderTarget/CdfCaches';
import { fdmNodeCacheContentMock } from './fdmNodeCache';

const cdfCachesMock = new Mock<CdfCaches>()
  .setup((p) => p.fdmNodeCache)
  .returns(fdmNodeCacheContentMock)
  .object();

export const renderTargetMock = new Mock<RevealRenderTarget>()
  .setup((p) => p.cdfCaches)
  .returns(cdfCachesMock)
  .object();
