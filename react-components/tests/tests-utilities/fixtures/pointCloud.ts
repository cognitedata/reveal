import {
  type AddModelOptions,
  CognitePointCloudModel,
  type ClassicDataSourceType
} from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Matrix4 } from 'three';
import { type TaggedAddPointCloudResourceOptions } from '../../../src/components/Reveal3DResources/types';

export const pointCloudModelOptions: AddModelOptions<ClassicDataSourceType> = {
  modelId: 321,
  revisionId: 654
} as const;

export const taggedPointCloudModelOptions = {
  type: 'pointcloud',
  addOptions: pointCloudModelOptions
} as const satisfies TaggedAddPointCloudResourceOptions;

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
