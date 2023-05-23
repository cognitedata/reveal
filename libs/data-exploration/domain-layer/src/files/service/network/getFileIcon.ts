import { CogniteClient } from '@cognite/sdk';

export const getFileIcon = (sdk: CogniteClient, fileId?: number) =>
  sdk
    .get(`/api/v1/projects/${sdk.project}/files/icon`, {
      params: { id: fileId },

      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      responseType: 'arraybuffer',
    })
    .then((response) => response.data);
