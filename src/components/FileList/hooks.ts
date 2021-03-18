import { useFilesAnnotatedWithResource } from '@cognite/data-exploration';
import { FileInfo as File, IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { isFilePreviewable } from 'components/FileList';
import uniqBy from 'lodash/uniqBy';
import { useQuery } from 'react-query';

const PREFIX = 'CDF_ANNOTATION_';

export const useFilesAssetAppearsIn = (assetId?: string) => {
  const sdk = useSDK();

  const { data: annotations = [] } = useFilesAnnotatedWithResource(
    {
      id: assetId,
      type: 'asset',
    },
    !!assetId
  );

  const ids = uniqBy(
    annotations.map(({ metadata = {} }) => {
      if (metadata[`${PREFIX}file_external_id`]) {
        return {
          externalId: metadata[`${PREFIX}file_external_id`],
        };
      }
      if (metadata[`${PREFIX}file_id`]) {
        return { id: parseInt(metadata[`${PREFIX}file_id`], 10) };
      }
      return undefined;
    }),
    (
      i:
        | { id: number; externalId: undefined }
        | { id: undefined; externalId: string }
        | undefined
    ) => i?.externalId || i?.id
  ).filter(Boolean) as IdEither[];

  const itemsEnabled = ids && ids.length > 0;

  return useQuery(
    ['files', ids],
    async () => {
      return sdk.files.retrieve(ids);
    },
    { enabled: itemsEnabled }
  );
};

export const useFileIcon = (file: File) => {
  const sdk = useSDK();

  return useQuery(
    ['cdf', 'file', 'icon', file.id],
    async () => {
      if (!isFilePreviewable(file)) {
        return undefined;
      }

      const icon = await sdk
        .get(`/api/v1/projects/${sdk.project}/files/icon`, {
          params: { id: file.id },
          headers: {
            Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          },
          responseType: 'arraybuffer',
        })
        .then((response) => response.data);
      return icon;
    },
    {
      retry: false,
      staleTime: Infinity,
    }
  );
};
