/*!
 * Copyright 2022 Cognite AS
 */

import { CompositeShape } from '@reveal/utilities';

import { applyDefaultModelTransformation } from '../utilities/applyDefaultModelTransformation';
import { PointCloudObject, CdfPointCloudObjectAnnotation } from './types';
import { PointCloudObjectData } from './PointCloudObjectAnnotationData';
import { StylableObject } from './StylableObject';

import { Matrix4 } from 'three';
import { File3dFormat } from '../types';

function cdfAnnotationsToPointCloudObjects(cdfAnnotations: CdfPointCloudObjectAnnotation[]): PointCloudObject[] {
  let idCounter = 0;

  const resultAnnotations = cdfAnnotations.map(cdfAnnotation => {
    idCounter++;

    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: idCounter
    };

    const cadFromCdfToThreeMatrix = new Matrix4();
    applyDefaultModelTransformation(cadFromCdfToThreeMatrix, File3dFormat.EptPointCloud);

    const annotation = {
      annotationId: cdfAnnotation.annotationId,
      assetId: cdfAnnotation.assetId,
      boundingBox: stylableObject.shape.createBoundingBox().applyMatrix4(cadFromCdfToThreeMatrix),
      stylableObject
    };

    return annotation;
  });

  return resultAnnotations;
}

export function cdfAnnotationsToObjectInfo(annotations: CdfPointCloudObjectAnnotation[]): PointCloudObjectData {
  const translatedAnnotations = cdfAnnotationsToPointCloudObjects(annotations);

  return new PointCloudObjectData(translatedAnnotations);
}
