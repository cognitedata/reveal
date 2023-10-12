import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { AnnotationModel } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { ContainerType } from '@cognite/unified-file-viewer';

import type { IndustryCanvasContainerConfig } from '../types';

export const getResourceKey = (
  container: IndustryCanvasContainerConfig
): string => {
  if (container.type === ContainerType.DOCUMENT) {
    return `${container.metadata.resourceId}-${container.page}`;
  }
  return `${container.metadata.resourceId}`;
};

export const useAnnotationsMultiple = (
  containerConfigs: IndustryCanvasContainerConfig[]
) => {
  const sdk = useSDK();

  const queryKey = useMemo(() => {
    return containerConfigs
      .filter(
        (containerConfig) =>
          containerConfig.type === ContainerType.DOCUMENT ||
          containerConfig.type === ContainerType.IMAGE
      )
      .map(getResourceKey);
  }, [containerConfigs]);

  return useQuery(
    queryKey,
    async (): Promise<Record<string, AnnotationModel[]>> => {
      const annotationsByResourceKeyEntries = await Promise.all(
        containerConfigs.map(async (containerConfig) => {
          const resourceKey = getResourceKey(containerConfig);
          if (
            containerConfig.type !== ContainerType.IMAGE &&
            containerConfig.type !== ContainerType.DOCUMENT
          ) {
            return [resourceKey, []];
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
          return [resourceKey, annotations];
        })
      );
      return Object.fromEntries(annotationsByResourceKeyEntries);
    },
    {
      keepPreviousData: true,
    }
  );
};
