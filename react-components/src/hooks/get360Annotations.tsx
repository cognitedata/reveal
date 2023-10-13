/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery, type QueryFunction } from '@tanstack/react-query';
import { type CogniteClient, type AnnotationFilterProps, type AnnotationModel } from '@cognite/sdk';
import { use360ImagesFileIds } from './use360ImagesFileIds';
import { chunk } from 'lodash';

export const get360Annotations = (
  sdk: CogniteClient,
  siteIds: string[]
): UseQueryResult<AnnotationModel[] | undefined, unknown> => {
  const { data: fileIds, isFetched } = use360ImagesFileIds(siteIds, sdk);

  const queryFunction: QueryFunction<AnnotationModel[] | undefined> = async () => {
    const annotationArray = await Promise.all(
      chunk(fileIds, 1000).map(async (fileIdsChunk) => {
        const filter: AnnotationFilterProps = {
          annotatedResourceIds: fileIdsChunk?.map((id) => ({ id })) ?? [],
          annotatedResourceType: 'file',
          annotationType: 'images.AssetLink'
        };
        const annotations = await sdk.annotations
          .list({
            limit: 1000,
            filter
          })
          .autoPagingToArray({ limit: Infinity });
        return annotations;
      })
    );

    return annotationArray.flat();
  };

  const queryResult = useQuery<AnnotationModel[] | undefined>(
    ['cdf', '3d', 'annotations', siteIds],
    queryFunction,
    {
      staleTime: Infinity,
      enabled: isFetched
    }
  );

  return queryResult;
};
