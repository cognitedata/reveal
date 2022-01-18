import { v3Client as client } from '@cognite/cdf-sdk-singleton';

export const retrieveDownloadUrl = async (fileId: number) => {
  try {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: fileId },
    ]);
    return downloadUrl;
  } catch {
    return undefined;
  }
};
