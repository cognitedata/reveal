// @ts-ignore
import { UploadFile } from 'antd/lib/upload/interface';
import noop from 'lodash/noop';

import UploadGCS from '@cognite/gcs-browser-upload';

export default function GCSUploader(
  file: Blob | UploadFile,
  uploadUrl: string,
  callback: (info: any) => void = noop
) {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  const chunkMultiple = Math.min(
    Math.max(
      2, // 0.5MB min chunks
      // @ts-ignore
      Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'datastudio-upload',
    url: uploadUrl,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
}
