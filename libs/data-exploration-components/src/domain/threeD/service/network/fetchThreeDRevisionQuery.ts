import { CogniteClient, CogniteError, Revision3D } from '@cognite/sdk/dist/src';
import { FetchQueryOptions, QueryClient } from 'react-query';

import { queryKeys } from 'domain/queryKeys';

export const fetchThreeDRevisionQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId: number,
  revisionId: number,
  options?: FetchQueryOptions<Revision3D, CogniteError, Revision3D>
) => {
  return queryClient.fetchQuery<Revision3D, CogniteError, Revision3D>(
    queryKeys.retrieveThreeDRevision(modelId, revisionId),
    () => sdk.revisions3D.retrieve(modelId, revisionId),
    options
  );
};
