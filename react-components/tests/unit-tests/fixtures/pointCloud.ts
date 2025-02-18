import { CognitePointCloudModel, type ClassicDataSourceType } from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Matrix4 } from 'three';

export const pointCloudModelOptions = {
  modelId: 321,
  revisionId: 654
};

export function createPointCloudMock(): CognitePointCloudModel {
  return new Mock<CognitePointCloudModel<ClassicDataSourceType>>()
    .setup((p) => p.modelId)
    .returns(pointCloudModelOptions.modelId)
    .setup((p) => p.revisionId)
    .returns(pointCloudModelOptions.revisionId)
    .setup((p) => p.getModelTransformation())
    .returns(new Matrix4())
    .prototypeof(CognitePointCloudModel.prototype)
    .object();
}
