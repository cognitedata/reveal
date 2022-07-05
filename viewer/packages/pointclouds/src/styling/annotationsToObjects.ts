/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectAnnotation, CdfPointCloudObjectAnnotation } from '../annotationTypes';
import { PointCloudObjectProvider } from './PointCloudObjectProvider';
import { CompositeShape } from './shapes/CompositeShape';
import { StylableObject } from './StylableObject';

function cdfAnnotationsToRevealAnnotations(bvs: CdfPointCloudObjectAnnotation[]): PointCloudObjectAnnotation[] {
  let idCounter = 0;

  const resultAnnotations = bvs.map(bv => {
    idCounter++;

    const shapes = bv.region.map(primitive => primitive.transformToShape());

    const compShape = new CompositeShape(shapes);
    const stylableObject: StylableObject = {
      shape: compShape,
      objectId: idCounter
    };

    const annotation = {
      annotationId: bv.annotationId,
      assetId: bv.assetId,
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
