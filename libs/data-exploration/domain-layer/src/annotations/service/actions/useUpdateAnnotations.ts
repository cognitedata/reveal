import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import { AnnotationChangeById } from '@cognite/sdk/dist/src/types';
import { useMutation } from 'react-query';

import { persistAssetIds } from './useCreateAnnotation';
import { isExtendedAnnotationAnnotation } from '../../utils';
import { ExtendedAnnotation, isNotUndefined } from '@data-exploration-lib/core';

const persistAnnotationChanges = async (
  sdk: CogniteClient,
  annotationChanges: AnnotationChangeById[]
) => {
  if (annotationChanges.length === 0) {
    return;
  }

  return sdk.annotations.update(annotationChanges);
};

export const useUpdateAnnotations = (options: any) => {
  const sdk = useSDK();
  const { mutate } = useMutation(async (annotations: ExtendedAnnotation[]) => {
    return Promise.all([
      persistAnnotationChanges(
        sdk,
        annotations
          .filter(isExtendedAnnotationAnnotation)
          .map((extendedAnnotationAnnotation) => ({
            id: extendedAnnotationAnnotation.metadata.id,
            update: {
              annotationType: {
                set: extendedAnnotationAnnotation.metadata.annotationType,
              },
              status: {
                set: extendedAnnotationAnnotation.metadata.status,
              },
              data: {
                set: extendedAnnotationAnnotation.metadata.data,
              },
            },
          }))
          .filter(isNotUndefined)
      ),
      persistAssetIds(sdk, annotations),
    ]);
  }, options);

  return mutate;
};
