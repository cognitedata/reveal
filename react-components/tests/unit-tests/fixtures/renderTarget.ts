import { Mock } from 'moq.ts';
import { type RevealRenderTarget } from '../../../src/architecture';
import { type CdfCaches } from '../../../src/architecture/base/renderTarget/CdfCaches';
import { fdmNodeCacheContentMock } from './fdmNodeCache';
import { viewerMock } from './viewer';
import { AssetMappingAndNode3DCache } from '../../../src/components/CacheProvider';
import { CogniteClient } from '@cognite/sdk';

const sdk = new CogniteClient({
  appId: 'cognite.reveal.unittest',
  project: 'dummy',
  getToken: async () => 'dummy'
});

const assetMappingAndNode3DCacheMock = new AssetMappingAndNode3DCache(sdk, false);

const cdfCachesMock = new Mock<CdfCaches>()
  .setup((p) => p.fdmNodeCache)
  .returns(fdmNodeCacheContentMock)
  .setup((p) => p.assetMappingAndNode3dCache)
  .returns(assetMappingAndNode3DCacheMock)
  .object();

export const renderTargetMock = new Mock<RevealRenderTarget>()
  .setup((p) => p.cdfCaches)
  .returns(cdfCachesMock)
  .setup((p) => p.viewer)
  .returns(viewerMock)
  .object();
