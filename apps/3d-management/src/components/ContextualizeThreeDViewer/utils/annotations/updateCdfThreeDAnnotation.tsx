import { Matrix4, Vector3, Quaternion } from 'three';

import { CognitePointCloudModel } from '@cognite/reveal';
import {
  CogniteClient,
  AnnotationChangeById,
  AnnotationData,
  AnnotationModel,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
} from '@cognite/sdk';

import {
  CubeAnnotation,
  setPendingAnnotation,
} from '../../useContextualizeThreeDViewerStore';
export const updateCdfThreeDAnnotation = async ({
  annotation,
  cubeAnnotation,
  sdk,
  pointCloudModel,
}: {
  annotation: AnnotationModel;
  cubeAnnotation: CubeAnnotation;
  sdk: CogniteClient;
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

  const assetLink =
    annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink;

  const data: AnnotationData = {
    region: [
      {
        box: {
          matrix: transformationMatrix.elements,
        },
      },
    ],
    assetRef: assetLink?.assetRef ?? undefined,
  };
  const hasAssetRef = assetLink?.assetRef !== undefined;
  const changes: AnnotationChangeById[] = [
    {
      id: annotation.id,
      update: {
        status: {
          // Set approved if it has assetRef set
          set: hasAssetRef ? 'approved' : annotation.status,
        },
        data: {
          set: data,
        },
      },
    },
  ];
  await sdk.annotations.update(changes);
  setPendingAnnotation(null);
};
