import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { AnnotationModel } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { ContainerConfig, ContainerType } from '@cognite/unified-file-viewer';

export const useAnnotationsMultiple = (containerConfigs: ContainerConfig[]) => {
  const sdk = useSDK();

  const queryKey = useMemo(() => {
    return containerConfigs
      .filter(
        (containerConfig) =>
          containerConfig.type === ContainerType.DOCUMENT ||
          containerConfig.type === ContainerType.IMAGE
      )
      .map((containerConfig) => {
        if (containerConfig.type === ContainerType.DOCUMENT) {
          return {
            resourceId: containerConfig.metadata.resourceId,
            page: containerConfig.page,
          };
        }

        return {
          resourceId: containerConfig.metadata.resourceId,
        };
      });
  }, [containerConfigs]);

  return useQuery(
    queryKey,
    async (): Promise<Record<string, AnnotationModel[]>> => {
      const annotationsByContainerIdEntries = await Promise.all(
        containerConfigs.map(async (containerConfig) => {
          if (
            containerConfig.type !== ContainerType.IMAGE &&
            containerConfig.type !== ContainerType.DOCUMENT
          ) {
            return [containerConfig.id, []];
          }

          if (containerConfig.metadata.resourceId === undefined) {
            throw new Error('Expected resourceId to be defined');
          }

          const annotations = (
            await sdk.annotations
              .list({
                filter: {
                  annotatedResourceType: 'file',
                  annotatedResourceIds: [
                    { id: containerConfig.metadata.resourceId },
                  ],
                },
                limit: 1000,
              })
              .autoPagingToArray({
                limit: Infinity,
              })
          ).filter((annotation) => {
            // @ts-expect-error
            const annotationPageNumber = annotation.data.pageNumber;
            if (containerConfig.type === ContainerType.IMAGE) {
              return true;
            }

            if (containerConfig.page === 1) {
              return (
                annotationPageNumber === 1 || annotationPageNumber === undefined
              );
            }

            return containerConfig.page === annotationPageNumber;
          });
          return [containerConfig.id, annotations];
        })
      );
      return Object.fromEntries(annotationsByContainerIdEntries);
    },
    {
      keepPreviousData: true,
    }
  );
};
