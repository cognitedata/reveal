import { Asset, FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import {
  CogniteAnnotation,
  listAnnotationsForFile,
  listFilesAnnotatedWithAssetId,
} from '@cognite/annotations';
import unionBy from 'lodash/unionBy';
import { isFilePreviewable, isPreviewableImage } from './utils';

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
      let annotatedFiles: File[] = [];
      try {
        annotatedFiles = await listFilesAnnotatedWithAssetId(sdk, asset!);
      } catch (ignoredErr) {
        // eslint-disable-next-line no-empty
      }

      let linkedSvgFiles: File[] = [];
      try {
        const linkedSvgs = await sdk.files.list({
          filter: {
            /**
             * NOTE: assetExternalIds is not supported by the SDK client,
             * but is supported by the api (for some reason).
             */
            assetExternalIds: [asset?.externalId!],
            mimeType: 'image/svg+xml',
          } as any,
        });
        linkedSvgFiles = linkedSvgs.items;
      } catch (ignoredErr) {
        // eslint-disable-next-line no-empty
      }

      let linkedPdfFiles: File[] = [];
      try {
        const linkedPdfs = await sdk.files.list({
          filter: {
            /**
             * NOTE: assetExternalIds is not supported by the SDK client,
             * but is supported by the api (for some reason).
             */
            assetExternalIds: [asset?.externalId!],
            mimeType: 'application/pdf',
          } as any,
        });
        linkedPdfFiles = linkedPdfs.items;
      } catch (ignoredErr) {
        // eslint-disable-next-line no-empty
      }

      return unionBy(
        annotatedFiles,
        [...linkedSvgFiles, ...linkedPdfFiles],
        'id'
      );
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

      if (isPreviewableImage(file)) {
        const urls = await sdk.files.getDownloadUrls([{ id: file.id }]);
        return urls[0].downloadUrl;
      }

      const icon = await sdk
        .get(
          `/api/v1/projects/${sdk.project}/documents/${file.id}/preview/image/pages/1`,
          {
            headers: {
              Accept: 'image/png',
            },
            responseType: 'arraybuffer',
          }
        )
        .then((response) => response.data);

      const arrayBufferView = new Uint8Array(icon);
      const blob = new Blob([arrayBufferView]);
      return URL.createObjectURL(blob);
    },
    {
      retry: false,
      staleTime: Infinity,
    }
  );
};
