import { CogniteAnnotation } from '@cognite/annotations';
import { FileWithAnnotations } from 'hooks';

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
