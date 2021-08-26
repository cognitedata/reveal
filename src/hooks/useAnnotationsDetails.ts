import { convertEventsToAnnotations } from '@cognite/annotations';
import { useAnnotations } from '@cognite/data-exploration';

const useAnnotationsDetails = (fileId: number) => {
  const { data: eventAnnotations, isFetched } = useAnnotations(fileId);

  const annotations = convertEventsToAnnotations(eventAnnotations);

  const assetTags = annotations.filter((an) => an.resourceType === 'asset');
  const fileTags = annotations.filter((an) => an.resourceType === 'file');

  const pendingAssetTags = assetTags.filter((an) => an.status === 'unhandled');
  const pendingFileTags = fileTags.filter((an) => an.status === 'unhandled');

  return {
    assetTags,
    fileTags,
    pendingAssetTags,
    pendingFileTags,
    isFetched,
  };
};

export default useAnnotationsDetails;
