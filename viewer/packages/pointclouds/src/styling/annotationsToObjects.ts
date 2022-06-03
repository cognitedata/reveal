/*!
 * Copyright 2022 Cognite AS
 */

import {
  PointCloudObjectAnnotation,
  PointCloudObjectAnnotationsWithIndexMap,
  CdfPointCloudObjectAnnotation
} from '../annotationTypes';
import { CompositeShape } from './shapes/CompositeShape';
import { StylableObject } from './StylableObject';

function cdfAnnotationsToRevealAnnotationsAndIdMap(
  bvs: CdfPointCloudObjectAnnotation[]
): [PointCloudObjectAnnotation[], Map<number, number>] {
  let idCounter = 0;
  const idMap = new Map<number, number>();

  const resultAnnotations = bvs.map((bv, ind) => {
    idMap.set(bv.annotationId, ind);

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

  return [resultAnnotations, idMap];
}

export function annotationsToObjectInfo(
  annotations: CdfPointCloudObjectAnnotation[]
): PointCloudObjectAnnotationsWithIndexMap {
  const [translatedAnnotations, idMap] = cdfAnnotationsToRevealAnnotationsAndIdMap(annotations);

  return { annotations: translatedAnnotations, annotationIdToIndexMap: idMap };
}
