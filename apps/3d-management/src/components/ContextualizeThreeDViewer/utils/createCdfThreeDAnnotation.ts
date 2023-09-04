import { Matrix4, Vector3 } from 'three';

import { CognitePointCloudModel } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk/dist/src';

import { ThreeDPosition } from '../useContextualizeThreeDViewerStore';

export const createCdfThreeDAnnotation = ({
  position,
  sdk,
  modelId,
  assetRefId,
  pointCloudModel,
}: {
  position: ThreeDPosition;
  sdk: CogniteClient;
  modelId: number;
  assetRefId: number;
  pointCloudModel: CognitePointCloudModel;
}) => {
  const vector3Position = new Vector3(position.x, position.y, position.z);
  const cdfPosition = vector3Position
    .clone()
    .applyMatrix4(
      pointCloudModel.getCdfToDefaultModelTransformation().invert()
    );

  sdk.annotations.create([
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
              matrix: new Matrix4()
                .makeTranslation(cdfPosition.x, cdfPosition.y, cdfPosition.z)
                .transpose().elements,
            },
          },
        ],
      },
    },
  ]);
};
