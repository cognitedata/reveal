import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { AnnotationModel } from '@cognite/sdk';
import { ContainerReference, ContainerReferenceType } from '../types';

const queryKey = (containerReferences: ContainerReference[]) => [
  'industry-canvas-annotations',
  containerReferences,
];

export const useAnnotationsMultiple = (
  containerReferences: ContainerReference[]
) => {
  const sdk = useSDK();

  return useQuery(
    queryKey(containerReferences),
    (): Promise<AnnotationModel[][]> =>
      Promise.all(
        containerReferences.map(async (containerReference) => {
          if (containerReference.type !== ContainerReferenceType.FILE) {
            return [];
          }

          return (
            await sdk.annotations
              .list({
                filter: {
                  annotatedResourceType: 'file',
                  annotatedResourceIds: [{ id: containerReference.resourceId }],
                },
                limit: 1000,
              })
              .autoPagingToArray({
                limit: Infinity,
              })
          ).filter((annotation) => {
            // @ts-expect-error
            const annotationPageNumber = annotation.data.pageNumber;
            if (containerReference.page === 1) {
              return (
                annotationPageNumber === 1 || annotationPageNumber === undefined
              );
            }

            return containerReference.page === annotationPageNumber;
          });
        })
      )
  );
};
