import { AnnotationFilterRequest } from '@cognite/sdk-playground';
import { useCognitePlaygroundClient } from 'src/hooks/useCognitePlaygroundClient';
import { useQuery } from 'react-query';
import { InternalId } from '@cognite/sdk';

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
  const sdk = useCognitePlaygroundClient();

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
  const sdk = useCognitePlaygroundClient();

  return useQuery(
    ['annotationsCreateQuery', ids],
    () => sdk.annotations.retrieve(ids),
    {}
  );
};
