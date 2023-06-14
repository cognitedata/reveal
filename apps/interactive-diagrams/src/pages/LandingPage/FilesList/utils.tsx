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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    isAnAssetOrFileTag(fileA?.annotations)?.length -
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    isAnAssetOrFileTag(fileB?.annotations)?.length
  );
};
