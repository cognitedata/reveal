import { AnnotationFilterRequest } from '@cognite/sdk-playground';
import { useQuery } from 'react-query';
import { InternalId } from '@cognite/sdk';
import { cognitePlaygroundClient } from './CognitePlaygroundClient';

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
    () => cognitePlaygroundClient.annotations.list(filter),
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
    () => cognitePlaygroundClient.annotations.retrieve(ids),
    {}
  );
};
