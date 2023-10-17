import { Matrix4, Vector3, Quaternion } from 'three';

import { CognitePointCloudModel } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

import { CubeAnnotation } from '../useContextualizeThreeDViewerStore';

export const createCdfThreeDAnnotation = async ({
  cubeAnnotation,
  sdk,
  modelId,
  assetId,
  pointCloudModel,
}: {
  cubeAnnotation: CubeAnnotation;
  sdk: CogniteClient;
  modelId: number;
  assetId: number;
  pointCloudModel: CognitePointCloudModel;
}) => {
  const defaultModelToCdfTransformation = pointCloudModel
    .getCdfToDefaultModelTransformation()
    .invert();

  const position = new Vector3(
    cubeAnnotation.position.x,
    cubeAnnotation.position.y,
    cubeAnnotation.position.z
  );
  const scale = new Vector3(
    Math.abs(cubeAnnotation.size.x),
    Math.abs(cubeAnnotation.size.y),
    Math.abs(cubeAnnotation.size.z)
  ).multiplyScalar(0.5);

  const transformationMatrix = new Matrix4()
    .compose(position, new Quaternion(), scale)
    .premultiply(defaultModelToCdfTransformation)
    .transpose();

  await sdk.annotations.create([
    {
      annotatedResourceId: modelId,
      annotatedResourceType: 'threedmodel',
      annotationType: 'pointcloud.BoundingVolume',
      status: assetId ? 'suggested' : 'approved',
      creatingApp: '3d-management',
      creatingUser: '3d-management',
      creatingAppVersion: '0.0.1',
      data: {
        assetRef: { id: assetId },
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
