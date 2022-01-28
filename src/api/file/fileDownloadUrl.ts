import sdk from '@cognite/cdf-sdk-singleton';

export const retrieveDownloadUrl = async (fileId: number) => {
  try {
    const [{ downloadUrl }] = await sdk.files.getDownloadUrls([{ id: fileId }]);
    return downloadUrl;
  } catch {
    return undefined;
  }
};
