/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import { CoreDm3dFdm3dDataProvider } from './CoreDm3dDataProvider';
import { Mock, It, type IMock } from 'moq.ts';
import { type FdmSDK } from '../FdmSDK';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';
import { beforeEach } from 'node:test';
import { type AddImage360CollectionDatamodelsOptions } from '../../components';
import {
  modelInstanceFixture0,
  revisionInstanceFixture0
} from '../../../tests/tests-utilities/fixtures/dm/model3dData';

const image360CollectionId: AddImage360CollectionDatamodelsOptions = {
  externalId: 'image360Collection0',
  space: 'space0',
  source: 'cdm'
};

const modelId0 = 1234;
const revisionId0 = 5678;

describe(CoreDm3dFdm3dDataProvider.name, () => {
  let fdmSdkMock: IMock<FdmSDK>;

  beforeEach(() => {
    fdmSdkMock = createFdmSdkMock();
  });

  it('should fetch model ref for classic input model options', async () => {
    const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());

    const result = await coreDmProvider.getDMSModels(modelId0);

    expect(result).toEqual([restrictToDmsId(modelInstanceFixture0)]);
  });

  it('should fetch revision ref for classic input model options', async () => {
    const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());

    const result = await coreDmProvider.getRevisionRefs([
      { modelId: modelId0, revisionId: revisionId0 }
    ]);

    expect(result).toEqual([restrictToDmsId(revisionInstanceFixture0)]);
  });

  it('should return the input ID when input is CoreDM image360 options', async () => {
    const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());

    const result = await coreDmProvider.getRevisionRefs([image360CollectionId]);

    expect(result).toEqual([restrictToDmsId(image360CollectionId)]);
  });
});

function createFdmSdkMock(): IMock<FdmSDK> {
  return new Mock<FdmSDK>()
    .setup(
      async (p) =>
        await p.queryNodesAndEdges(
          It.Is(
            (query) =>
              (query as any).with?.models?.nodes?.filter?.and?.[0]?.equals?.value ===
              `cog_3d_model_${modelId0}`
          )
        )
    )
    .returns(Promise.resolve({ items: { models: [modelInstanceFixture0] } }))
    .setup(
      async (p) =>
        await p.queryNodesAndEdges(
          It.Is(
            (query) =>
              (query as any).parameters?.revisionExternalId === `cog_3d_revision_${revisionId0}`
          )
        )
    )
    .returns(Promise.resolve({ items: { revision: [revisionInstanceFixture0] } }));
}
