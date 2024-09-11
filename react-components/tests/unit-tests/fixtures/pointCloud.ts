import { type CognitePointCloudModel } from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Matrix4 } from 'three';

export const pointCloudModelOptions = {
  modelId: 321,
  revisionId: 654
};

export const pointCloudMock = new Mock<CognitePointCloudModel>()
  .setup((p) => p.modelId)
  .returns(pointCloudModelOptions.modelId)
  .setup((p) => p.revisionId)
  .returns(pointCloudModelOptions.revisionId)
  .setup((p) => p.getModelTransformation())
  .returns(new Matrix4())
  .object();
