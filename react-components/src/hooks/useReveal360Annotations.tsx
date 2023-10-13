/*!
 * Copyright 2023 Cognite AS
 */

import { useReveal } from '../components/RevealContainer/RevealContext';
import { type AssetAnnotationImage360Info, type Image360Collection } from '@cognite/reveal';
import { type Annotation360Data } from './types';

export const useReveal360Annotations = (): Annotation360Data[] => {
  const reveal = useReveal();

  const image30Collections = reveal.get360ImageCollections();
  const annotationsInfo: AssetAnnotationImage360Info[] = [];
  image30Collections.map(async (image360Collection: Image360Collection): Promise<void> => {
    const annotations = await image360Collection.getAnnotationsInfo('assets');
    annotationsInfo.push(...annotations);
  });

  const result = annotationsInfo.map(
    (annotation: AssetAnnotationImage360Info): Annotation360Data => {
      return {
        id: annotation.annotationInfo.id.toString(),
        externalId: annotation.annotationInfo.annotatedResourceId.toString(),
        type: annotation.annotationInfo.annotationType,
        createdTime: annotation.annotationInfo.createdTime.toDateString(),
        lastUpdatedTime: annotation.annotationInfo.lastUpdatedTime.toDateString()
      };
    }
  );

  return result;
};
