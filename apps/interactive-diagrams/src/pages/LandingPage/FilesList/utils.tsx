import { FileWithAnnotations } from '@interactive-diagrams-app/hooks';

import { CogniteAnnotation } from '@cognite/annotations';

export const isAnAssetOrFileTag = (annotations: CogniteAnnotation[]) => {
  return (
    annotations?.filter(
      (an) => an.resourceType === 'asset' || an.resourceType === 'file'
    ) ?? []
  );
};
export const sortFilesByAnnotations = (
  fileA: FileWithAnnotations,
  fileB: FileWithAnnotations
) => {
  return (
    isAnAssetOrFileTag(fileA?.annotations)?.length -
    isAnAssetOrFileTag(fileB?.annotations)?.length
  );
};
