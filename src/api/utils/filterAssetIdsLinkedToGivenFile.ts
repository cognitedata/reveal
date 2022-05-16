import sdk from '@cognite/cdf-sdk-singleton';

export const filterAssetIdsLinkedToGivenFile = async (
  assetIds: number[],
  fileId: number
) => {
  let assetIdsLinkedToFile: number[] = [];
  const fileResponse = await sdk.files.retrieve([{ id: fileId }]);

  if (fileResponse && fileResponse.length) {
    const file = fileResponse[0]!;
    assetIdsLinkedToFile = assetIds.reduce((acc: number[], assetId) => {
      if (file?.assetIds?.includes(assetId)) {
        return acc.concat(assetId);
      }
      return acc;
    }, []);
  }
  return assetIdsLinkedToFile;
};
