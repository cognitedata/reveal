/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectAnnotation, CdfPointCloudObjectAnnotation } from '../annotationTypes';
import { PointCloudObjectProvider } from './PointCloudObjectProvider';
import { CompositeShape } from './shapes/CompositeShape';
import { StylableObject } from './StylableObject';

function cdfAnnotationsToRevealAnnotations(
  cdfAnnotations: CdfPointCloudObjectAnnotation[]
): PointCloudObjectAnnotation[] {
  let idCounter = 0;

  const resultAnnotations = cdfAnnotations.map(cdfAnnotation => {
    idCounter++;

    const shapes = cdfAnnotation.region;

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: idCounter
    };

    const annotation = {
      annotationId: cdfAnnotation.annotationId,
      assetId: cdfAnnotation.assetId,
      stylableObject
    };

    return annotation;
  });

  return resultAnnotations;
}

export function annotationsToObjectInfo(annotations: CdfPointCloudObjectAnnotation[]): PointCloudObjectProvider {
  const translatedAnnotations = cdfAnnotationsToRevealAnnotations(annotations);

  return new PointCloudObjectProvider(translatedAnnotations);
}
