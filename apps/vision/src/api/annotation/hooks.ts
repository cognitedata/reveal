import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { AnnotationFilterRequest, InternalId } from '@cognite/sdk';

/**
 * ## Example
 * ```typescript
 * const { data, fetchNextPage, hasNextPage } = useAnnotationsList({
 *   annotatedResourceType: 'file',
 *   annotatedResourceIds: [{ id: 522578475963356 }],
 * });
 * ```
 */
export const useAnnotationsListQuery = (filter: AnnotationFilterRequest) => {
  return useQuery(
    ['annotationsListQuery', filter],
    () => sdk.annotations.list(filter),
    {}
  );
};

/**
 * ## Example
 * ```typescript
 * const {data} = useAnnotationsCreate({
 *   ids: [1],
 * });
 * ```
 */
export const useAnnotationsRetrieveQuery = (ids: InternalId[]) => {
  return useQuery(
    ['annotationsCreateQuery', ids],
    () => sdk.annotations.retrieve(ids),
    {}
  );
};
