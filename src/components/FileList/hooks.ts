import { Asset, FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { isFilePreviewable } from 'components/FileList';
import { useQuery } from 'react-query';
import {
  CogniteAnnotation,
  listAnnotationsForFile,
  listFilesAnnotatedWithAssetId,
} from '@cognite/annotations';

export const useAssetAnnotations = (file?: File) => {
  const sdk = useSDK();

  return useQuery<CogniteAnnotation[]>(
    ['annotations', file?.id],
    async () => {
      const annotations = await listAnnotationsForFile(sdk, file!);
      return annotations.filter((a) => a.resourceType === 'asset');
    },
    { enabled: !!file }
  );
};

export const useFilesAssetAppearsIn = (asset?: Asset, enabled = true) => {
  const sdk = useSDK();

  return useQuery<File[]>(
    ['annotated-files', { assetId: asset?.id }],
    async () => {
      return listFilesAnnotatedWithAssetId(sdk, asset!);
    },
    { enabled: !!asset && enabled }
  );
};

export const useFileIcon = (file: File) => {
  const sdk = useSDK();

  return useQuery(
    ['file', 'icon', file.id],
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
