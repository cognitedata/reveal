import UploadGCS from '@cognite/gcs-browser-upload';
import { CogniteClient, ExternalFileInfo } from '@cognite/sdk';

const CHUNK_MULTIPLE = 262144;

const getChunkSize = (fileSize: number) =>
  Math.min(Math.max(2, Math.ceil((fileSize / 20) * CHUNK_MULTIPLE)), 200) *
  CHUNK_MULTIPLE;

const getUploadGCS = (file: Blob, url: string, { ...args } = {}) =>
  new UploadGCS({
    id: 'simconfig-upload',
    file,
    url,
    chunkSize: getChunkSize(file.size),
    ...args,
  });

// Simple wrapper that handles both the CDF upload request (with file
// info/metadata), and the actual file upload to GCS.
export async function cdfUpload(
  client: CogniteClient,
  file: File,
  fileInfo: ExternalFileInfo = { name: file.name }
) {
  const ret = await client.files.upload(fileInfo);
  if (!('uploadUrl' in ret)) {
    throw new Error('Error while uploading file to CDF');
  }
  return getUploadGCS(file, ret.uploadUrl).start();
}
