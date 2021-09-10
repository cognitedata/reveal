import { useAnnotationsForFiles } from 'hooks';

const useAnnotationsDetails = (fileId: number) => {
  const { annotations, isFetched } = useAnnotationsForFiles([fileId]);

  const assetTags =
    annotations[fileId]?.filter(
      (an) => an.resourceType === 'asset' && an.status !== 'deleted'
    ) ?? [];
  const fileTags =
    annotations[fileId]?.filter(
      (an) => an.resourceType === 'file' && an.status !== 'deleted'
    ) ?? [];

  const pendingAssetTags =
    assetTags?.filter((an) => an.status === 'unhandled') ?? [];
  const pendingFileTags =
    fileTags?.filter((an) => an.status === 'unhandled') ?? [];

  return {
    assetTags,
    fileTags,
    pendingAssetTags,
    pendingFileTags,
    isFetched,
  };
};

export default useAnnotationsDetails;
