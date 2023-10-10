import { Matrix4, Vector3, Quaternion } from 'three';

import { CognitePointCloudModel } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

import { CubeAnnotation } from '../useContextualizeThreeDViewerStore';

export const createCdfThreeDAnnotation = async ({
  cubeAnnotation,
  sdk,
  modelId,
  assetRefId,
  pointCloudModel,
}: {
  cubeAnnotation: CubeAnnotation;
  sdk: CogniteClient;
  modelId: number;
  assetRefId: number;
  pointCloudModel: CognitePointCloudModel;
}) => {
  const defaultModelToCdfTransformation = pointCloudModel
    .getCdfToDefaultModelTransformation()
    .invert();

  const vector3Position = new Vector3(
    cubeAnnotation.position.x,
    cubeAnnotation.position.y,
    cubeAnnotation.position.z
  );
  const vector3Size = new Vector3(
    cubeAnnotation.size.x,
    cubeAnnotation.size.y,
    cubeAnnotation.size.z
  ).multiplyScalar(0.5);

  const cdfPosition = vector3Position.applyMatrix4(
    defaultModelToCdfTransformation
  );

  const cdfSize = vector3Size.applyMatrix4(defaultModelToCdfTransformation);

  const transformationMatrix = new Matrix4()
    .compose(cdfPosition, new Quaternion(), cdfSize)
    .transpose();
  await sdk.annotations.create([
    {
      annotatedResourceId: modelId,
      annotatedResourceType: 'threedmodel',
      annotationType: 'pointcloud.BoundingVolume',
      status: 'suggested',
      creatingApp: '3d-management',
      creatingUser: '3d-management',
      creatingAppVersion: '0.0.1',
      data: {
        assetRef: { id: assetRefId },
        region: [
          {
            box: {
              matrix: transformationMatrix.elements,
            },
          },
        ],
      },
    },
  ]);
};
