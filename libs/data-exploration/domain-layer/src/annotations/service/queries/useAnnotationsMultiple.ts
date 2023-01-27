import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { AnnotationModel } from '@cognite/sdk';
import { queryKeys } from '../../../queryKeys';

type PagedFileReference = {
  id: number;
  page: number | undefined;
};

export const useAnnotationsMultiple = (
  pagedFileReferences: PagedFileReference[]
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.annotationsPagedFileReferences(pagedFileReferences),
    (): Promise<AnnotationModel[][]> =>
      Promise.all(
        pagedFileReferences.map(async (pagedFileReference) =>
          (
            await sdk.annotations
              .list({
                filter: {
                  annotatedResourceType: 'file',
                  annotatedResourceIds: [{ id: pagedFileReference.id }],
                },
                limit: 1000,
              })
              .autoPagingToArray()
          ).filter((annotation) => {
            // @ts-expect-error
            const annotationPageNumber = annotation.data.pageNumber;
            if (pagedFileReference.page === 1) {
              return (
                annotationPageNumber === 1 || annotationPageNumber === undefined
              );
            }

            return pagedFileReference.page === annotationPageNumber;
          })
        )
      )
  );
};
