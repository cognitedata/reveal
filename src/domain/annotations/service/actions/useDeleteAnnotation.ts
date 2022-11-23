import { useSDK } from '@cognite/sdk-provider';
import { useMutation } from 'react-query';
import { ExtendedAnnotation } from '../../../../containers/Files/FilePreview/FilePreviewUFV/types';
import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
  isExtendedAnnotationAnnotation,
  isExtendedEventAnnotation,
  isExtendedLocalAnnotation,
} from '../../../../containers/Files/FilePreview/FilePreviewUFV/migration/utils';

export const useDeleteAnnotation = (options: any) => {
  const sdk = useSDK();
  const { mutate } = useMutation(async (annotation: ExtendedAnnotation) => {
    const deleteAnnotationPromise = (() => {
      if (isExtendedEventAnnotation(annotation)) {
        return sdk.events.delete([{ id: annotation.metadata.id }]);
      }

      if (isExtendedAnnotationAnnotation(annotation)) {
        return sdk.annotations.delete([{ id: annotation.metadata.id }]);
      }
    })();

    const removeAssetIdFromFilePromise = (() => {
      if (isExtendedLocalAnnotation(annotation)) {
        return;
      }

      if (!isAssetAnnotation(annotation)) {
        return;
      }

      const fileId = getFileIdFromExtendedAnnotation(annotation);
      const resourceId = getResourceIdFromExtendedAnnotation(annotation);
      if (!fileId || !resourceId) {
        return;
      }

      return sdk.files.update([
        {
          id: fileId,
          update: {
            assetIds: {
              remove: [resourceId],
            },
          },
        },
      ]);
    })();

    return Promise.all([deleteAnnotationPromise, removeAssetIdFromFilePromise]);
  }, options);

  return mutate;
};
