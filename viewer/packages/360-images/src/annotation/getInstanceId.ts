import { DataSourceType } from '@reveal/data-providers';
import { InstanceReference } from '@reveal/data-providers/src/types';
import { isCoreDmImage360Annotation } from './typeGuards';
import { isImageAssetLinkAnnotation } from '@reveal/data-providers';

export function getInstanceIdFromAnnotation<T extends DataSourceType>(
  annotation: T['image360AnnotationType']
): InstanceReference<T> | undefined {
  if (isCoreDmImage360Annotation(annotation)) {
    return annotation.assetRef;
  } else {
    if (!isImageAssetLinkAnnotation(annotation)) {
      return undefined;
    }

    const assetRef = annotation.data.assetRef;
    if (assetRef.externalId !== undefined || assetRef.id !== undefined) {
      return assetRef as InstanceReference<T>;
    }
    return undefined;
  }
}
