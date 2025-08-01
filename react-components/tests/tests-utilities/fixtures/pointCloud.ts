import {
  type AddModelOptions,
  CognitePointCloudModel,
  type ClassicDataSourceType,
  type DMDataSourceType,
  PointColorType,
  PointShape
} from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Color, Matrix4 } from 'three';
import { type TaggedAddPointCloudResourceOptions } from '../../../src/components/Reveal3DResources/types';

export const pointCloudModelOptions: AddModelOptions<ClassicDataSourceType> = {
  modelId: 321,
  revisionId: 654
} as const;

export const taggedPointCloudModelOptions = {
  type: 'pointcloud',
  addOptions: pointCloudModelOptions
} as const satisfies TaggedAddPointCloudResourceOptions;

export const pointCloudClasses = [
  { name: 'Class 0', code: 0, color: new Color(1, 0, 0) },
  { name: 'Class 1', code: 1, color: new Color(0, 1, 0) },
  { name: 'Class 2', code: 2, color: new Color(0, 0, 1) },
  { name: 'Class 3', code: 3, color: new Color(1, 1, 0) },
  { name: 'Class 4', code: 4, color: new Color(0, 1, 1) },
  { name: 'Class 5', code: 5, color: new Color(1, 0, 1) },
  { name: 'Unused ', code: 6, color: new Color(1, 0, 1) }
];

export const pointCloudClassVisible = [true, true, true, true, true, true, false];

export const hasPointCloudClass = [true, true, true, true, true, true, false];

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

      // Mock classes
      .setup((p) => p.hasClass)
      .returns((pointClass: number) => {
        return hasPointCloudClass[pointClass];
      })
      .setup((p) => p.isClassVisible)
      .returns((pointClass: number) => {
        return pointCloudClassVisible[pointClass];
      })
      .setup((p) => p.setClassVisible)
      .returns((pointClass: number, visible: boolean) => {
        pointCloudClassVisible[pointClass] = visible;
      })
      .setup((p) => p.getClasses)
      .returns(() => {
        return pointCloudClasses;
      })
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
