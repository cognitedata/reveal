import { CogniteClient, FileInfo } from '@cognite/sdk';
import { isFilePreviewable } from '../utils/isFilePreviewable';
import { isPreviewableImage } from '../utils/isPreviewableImage';

export default async function fetchFilePreviewURL(
  sdk: CogniteClient,
  file: FileInfo
) {
  if (!isFilePreviewable(file)) return undefined;
  if (isPreviewableImage(file)) {
    const urls = await sdk.files.getDownloadUrls([{ id: file.id }]);
    return urls[0].downloadUrl;
  }
  // TODO(CHART-000):  Need to update this when the new SDK is in place
  const request = await sdk.get(
    `/api/v1/projects/${sdk.project}/documents/${file.id}/preview/image/pages/1`,
    { headers: { Accept: 'image/png' }, responseType: 'arraybuffer' }
  );
  const icon = request.data;
  const arrayBufferView = new Uint8Array(icon);
  const blob = new Blob([arrayBufferView]);
  return URL.createObjectURL(blob);
}
