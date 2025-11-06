import { type InstanceReference, isIdEither } from '../instanceIds';
import {
  isClassicImage360AssetAnnotationData,
  isDMImage360Annotation,
  isHybridImage360AssetAnnotationData
} from './typeGuards';
import { type Image360AnnotationContent } from './types';

export function getImage360AnnotationAssetRef(
  annotation: Image360AnnotationContent
): InstanceReference | undefined {
  if (isDMImage360Annotation(annotation)) {
    return annotation.assetRef;
  }
  if (isHybridImage360AssetAnnotationData(annotation.data)) {
    return annotation.data.instanceRef;
  }
  if (isClassicImage360AssetAnnotationData(annotation.data)) {
    return isIdEither(annotation.data.assetRef) ? annotation.data.assetRef : undefined;
  }
}
