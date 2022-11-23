import {
  CogniteAnnotation,
  convertAnnotationsToEvents,
} from '@cognite/annotations';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient, CogniteEvent, EventChange } from '@cognite/sdk';
import { AnnotationChangeById } from '@cognite/sdk/dist/src/types';
import omit from 'lodash/omit';
import { useMutation } from 'react-query';
import { isNotUndefined } from 'utils';
import {
  ANNOTATION_SOURCE_KEY,
  ExtendedAnnotation,
} from '../../../../containers/Files/FilePreview/FilePreviewUFV/types';
import {
  isExtendedAnnotationAnnotation,
  isExtendedEventAnnotation,
} from '../../../../containers/Files/FilePreview/FilePreviewUFV/migration/utils';
import { persistAssetIds } from './useCreateAnnotation';

const persistEventChanges = async (
  sdk: CogniteClient,
  eventChanges: EventChange[]
): Promise<CogniteEvent[] | undefined> => {
  if (eventChanges.length === 0) {
    return undefined;
  }

  return sdk.events.update(eventChanges);
};

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
      persistEventChanges(
        sdk,
        annotations
          .filter(isExtendedEventAnnotation)
          .map(extendedEventAnnotation => {
            const eventAnnotation: CogniteAnnotation = omit(
              extendedEventAnnotation.metadata,
              ANNOTATION_SOURCE_KEY
            );
            const event = convertAnnotationsToEvents([eventAnnotation])[0];

            if (event.id === undefined) {
              throw new Error('Event id is undefined');
            }

            const eventChange: EventChange = {
              id: event.id,
              update: {},
            };
            if (event.description) {
              eventChange.update.description = { set: event.description };
            }
            if (event.metadata) {
              eventChange.update.metadata = {
                set: event.metadata,
              };
            }

            if (Object.keys(eventChange.update).length > 0) {
              return eventChange;
            }

            return undefined;
          })
          .filter(isNotUndefined)
      ),
      persistAnnotationChanges(
        sdk,
        annotations
          .filter(isExtendedAnnotationAnnotation)
          .map(extendedAnnotationAnnotation => ({
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
