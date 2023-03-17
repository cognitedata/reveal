import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { AnnotationModel } from '@cognite/sdk';

const queryKey = (containerReferences: ContainerReference[]) => [
  'industry-canvas-annotations',
  containerReferences,
];

// TODO: Dedupe these types when we extract everything to a package
enum ContainerReferenceType {
  FILE = 'file',
  TIMESERIES = 'timeseries',
}

type FileContainerReference = {
  type: ContainerReferenceType.FILE;
  id: number;
  page: number | undefined;
};

type TimeseriesContainerReference = {
  type: ContainerReferenceType.TIMESERIES;
  id: number;
  startDate: Date;
  endDate: Date;
};

type ContainerReference = FileContainerReference | TimeseriesContainerReference;

export const useAnnotationsMultiple = (
  containerReferences: ContainerReference[]
) => {
  const sdk = useSDK();

  return useQuery(
    queryKey(containerReferences),
    (): Promise<AnnotationModel[][]> =>
      Promise.all(
        containerReferences.map(async (containerReference) => {
          if (containerReference.type === ContainerReferenceType.TIMESERIES) {
            return [];
          }

          return (
            await sdk.annotations
              .list({
                filter: {
                  annotatedResourceType: 'file',
                  annotatedResourceIds: [{ id: containerReference.id }],
                },
                limit: 1000,
              })
              .autoPagingToArray()
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
