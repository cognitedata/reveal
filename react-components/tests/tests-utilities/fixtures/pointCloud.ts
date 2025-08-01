import {
  type AddModelOptions,
  CognitePointCloudModel,
  type ClassicDataSourceType,
  type DMDataSourceType,
  PointColorType,
  PointShape
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

export function createPointCloudMock(parameters?: {
  visible?: boolean;
  modelId?: number;
  revisionId?: number;
}): CognitePointCloudModel {
  const modelId = parameters?.modelId ?? pointCloudModelOptions.modelId;
  const revisionId = parameters?.revisionId ?? pointCloudModelOptions.revisionId;

  const pointSize = 2;
  const pointColorType = PointColorType.Rgb;
  const pointShape = PointShape.Square;

  return (
    new Mock<CognitePointCloudModel<ClassicDataSourceType>>()
      .setup((p) => p.modelId)
      .returns(modelId)
      .setup((p) => p.revisionId)
      .returns(revisionId)
      .setup((p) => p.modelIdentifier)
      .returns({ modelId, revisionId })
      .setup((p) => p.getModelTransformation())
      .returns(new Matrix4())
      .setup((p) => p.visible)
      .returns(parameters?.visible ?? true)
      .setup((p) => p.type)
      .returns('pointcloud')

      // Mock pointSize
      .setup((p) => p.pointSize)
      .returns(pointSize)
      .setup((p) => {
        p.pointSize = pointSize;
      })
      .returns(true as any)

      // Mock pointColorType
      .setup((p) => p.pointColorType)
      .returns(pointColorType)
      .setup((p) => {
        p.pointColorType = pointColorType;
      })
      .returns(true as any)

      // Mock pointShape
      .setup((p) => p.pointShape)
      .returns(pointShape)
      .setup((p) => {
        p.pointShape = pointShape;
      })
      .returns(true as any)

      .prototypeof(CognitePointCloudModel.prototype)
      .object()
  );
}

export function createPointCloudDMMock(parameters?: {
  revisionExternalId?: string;
  revisionSpace?: string;
}): CognitePointCloudModel<DMDataSourceType> {
  return new Mock<CognitePointCloudModel<DMDataSourceType>>()
    .setup((p) => p.modelIdentifier)
    .returns({
      revisionExternalId: parameters?.revisionExternalId ?? 'cog_3d_pointcloud_123456',
      revisionSpace: parameters?.revisionSpace ?? 'point-cloud-space'
    })
    .setup((p) => p.type)
    .returns('pointcloud')
    .object();
}
