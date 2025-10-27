import {
  type AddModelOptions,
  CognitePointCloudModel,
  type ClassicDataSourceType,
  type DMDataSourceType,
  PointShape,
  PointColorType,
  type PointCloudIntersection,
  type DMInstanceRef,
  type PointCloudObjectMetadata
} from '@cognite/reveal';
import { Mock } from 'moq.ts';
import { Color, Matrix4, Vector3 } from 'three';
import { type TaggedAddPointCloudResourceOptions } from '../../../src/components/Reveal3DResources/types';
import { type AnnotationsAssetRef } from '@cognite/sdk';

export const pointCloudModelOptions: AddModelOptions<ClassicDataSourceType> = {
  modelId: 321,
  revisionId: 654
} as const;

export const taggedPointCloudModelOptions = {
  type: 'pointcloud',
  addOptions: pointCloudModelOptions
} as const satisfies TaggedAddPointCloudResourceOptions;

export const pointCloudClasses = [
  { name: 'Class 0', code: 0, color: new Color(1, 0, 0), visible: true, hasClass: true },
  { name: 'Class 1', code: 1, color: new Color(0, 1, 0), visible: true, hasClass: true },
  { name: 'Class 2', code: 2, color: new Color(0, 0, 1), visible: true, hasClass: true },
  { name: 'Class 3', code: 3, color: new Color(1, 1, 0), visible: true, hasClass: true },
  { name: 'Class 4', code: 4, color: new Color(0, 1, 1), visible: true, hasClass: true },
  { name: 'Class 5', code: 5, color: new Color(1, 0, 1), visible: true, hasClass: true },
  { name: 'Unused ', code: 6, color: new Color(1, 0, 1), visible: false, hasClass: false } // THe Unused class last, to simplify the test logic
];

export function createPointCloudMock(parameters?: {
  visible?: boolean;
  modelId?: number;
  revisionId?: number;
  stylableObjects?: Array<PointCloudObjectMetadata<ClassicDataSourceType>>;
}): CognitePointCloudModel {
  const modelId = parameters?.modelId ?? pointCloudModelOptions.modelId;
  const revisionId = parameters?.revisionId ?? pointCloudModelOptions.revisionId;
  const modelTransformation = new Matrix4().identity();

  const pointCloud = new Mock<CognitePointCloudModel<ClassicDataSourceType>>()
    .setup((p) => p.modelId)
    .returns(modelId)
    .setup((p) => p.revisionId)
    .returns(revisionId)
    .setup((p) => p.modelIdentifier)
    .returns({ modelId, revisionId })
    .setup((p) => p.type)
    .returns('pointcloud')

    // Mock classes
    .setup((p) => p.hasClass)
    .returns((pointClass: number) => {
      return pointCloudClasses[pointClass].hasClass;
    })
    .setup((p) => p.isClassVisible)
    .returns((pointClass: number) => {
      return pointCloudClasses[pointClass].visible;
    })
    .setup((p) => p.setClassVisible)
    .returns((pointClass: number, visible: boolean) => {
      pointCloudClasses[pointClass].visible = visible;
    })
    .setup((p) => p.getClasses)
    .returns(() => {
      return pointCloudClasses;
    })
    .setup((p) => p.stylableObjects)
    .returns(parameters?.stylableObjects ?? [])
    .prototypeof(CognitePointCloudModel.prototype)
    .object();

  // Set default values on some properties (otherwise they will be undefined)
  pointCloud.visible = parameters?.visible ?? true;
  pointCloud.pointShape = PointShape.Circle;
  pointCloud.pointSize = 1;
  pointCloud.pointColorType = PointColorType.Rgb;
  pointCloud.getModelTransformation = () => modelTransformation;
  pointCloud.setModelTransformation = (matrix: Matrix4) => {
    modelTransformation.copy(matrix);
  };

  return pointCloud;
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

export function createPointCloudIntersectionMock(parameters: {
  model: CognitePointCloudModel<ClassicDataSourceType | DMDataSourceType>;
  assetRef: AnnotationsAssetRef | DMInstanceRef | undefined;
  instanceRef: DMInstanceRef | undefined;
  annotationId?: number;
}): PointCloudIntersection<ClassicDataSourceType | DMDataSourceType> {
  return {
    type: 'pointcloud',
    model: parameters.model,
    volumeMetadata: {
      assetRef: parameters?.assetRef ?? { id: 123 },
      instanceRef: parameters?.instanceRef,
      annotationId: parameters?.annotationId ?? 1
    },
    point: new Vector3(1, 2, 3),
    pointIndex: 0,
    distanceToCamera: 0,
    annotationId: parameters?.annotationId ?? 1
  };
}
