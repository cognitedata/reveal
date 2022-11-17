import UploadGCS from '@cognite/gcs-browser-upload';
import { UploadFile } from 'antd/lib/upload/interface';

export const GCSUploader = (
  file: Blob | UploadFile,
  uploadUrl: string,
  contentType: string,
  callback: (info: any) => void = () => {}
) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  const chunkMultiple = Math.min(
    Math.max(
      2,
      Math.ceil((file?.size ?? 0 / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'cognite-data-fusion-upload',
    url: uploadUrl,
    contentType,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
};
