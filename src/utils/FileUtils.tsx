import mime from 'mime-types';
import { FileInfo, CogniteClient } from 'cognite-sdk-v3';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const isFilePreviewable = (file?: FileInfo) =>
  file
    ? file.mimeType === 'application/pdf' || isPreviewableImage(file)
    : false;

export const isPreviewableImage = (file: FileInfo) => {
  const { mimeType = '' } = file;
  return ['png', 'jpeg', 'jpg', 'svg'].some(el => mimeType.includes(el));
};

export const retrieveDownloadUrl = async (
  client: CogniteClient,
  fileId: number
) => {
  try {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: fileId },
    ]);
    return downloadUrl;
  } catch {
    return undefined;
  }
};
