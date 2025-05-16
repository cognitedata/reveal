import { CognitePointCloudModel, type ClassicDataSourceType } from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Matrix4 } from 'three';

export const pointCloudModelOptions = {
  modelId: 321,
  revisionId: 654
};

export function createPointCloudMock(parameters?: { visible?: boolean }): CognitePointCloudModel {
  return new Mock<CognitePointCloudModel<ClassicDataSourceType>>()
    .setup((p) => p.modelId)
    .returns(pointCloudModelOptions.modelId)
    .setup((p) => p.revisionId)
    .returns(pointCloudModelOptions.revisionId)
    .setup((p) => p.getModelTransformation())
    .returns(new Matrix4())
    .setup((p) => p.visible)
    .returns(parameters?.visible ?? true)
    .setup((p) => p.type)
    .returns('pointcloud')
    .prototypeof(CognitePointCloudModel.prototype)
    .object();
}
