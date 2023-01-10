import { useSDK } from '@cognite/sdk-provider';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMutation } from 'react-query';
import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
  isExtendedAnnotationAnnotation,
  isExtendedEventAnnotation,
  isExtendedLocalAnnotation,
} from '../../utils';

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

      return undefined;
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
