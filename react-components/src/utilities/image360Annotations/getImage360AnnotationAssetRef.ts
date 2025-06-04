import { type InstanceReference, isIdEither } from '../instanceIds';
import { isClassicImage360Annotation, isClassicImage360AssetAnnotationData } from './typeGuards';
import { type Image360AnnotationContent } from './types';

export function getImage360AnnotationAssetRef(
  annotation: Image360AnnotationContent
): InstanceReference | undefined {
  if (!isClassicImage360Annotation(annotation)) {
    return annotation.assetRef;
  }
  if (isClassicImage360AssetAnnotationData(annotation.data)) {
    return isIdEither(annotation.data.assetRef) ? annotation.data.assetRef : undefined;
  }
}
