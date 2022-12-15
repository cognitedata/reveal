import { CogniteClient, CogniteError, Model3D } from '@cognite/sdk/dist/src';
import { FetchQueryOptions, QueryClient } from 'react-query';

import { queryKeys } from 'domain/queryKeys';

export const fetchThreeDModelQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId: number,
  options?: FetchQueryOptions<Model3D, CogniteError, Model3D>
) => {
  return queryClient.fetchQuery<Model3D, CogniteError, Model3D>(
    queryKeys.retrieveThreeDModel(modelId),
    () => sdk.models3D.retrieve(modelId),
    options
  );
};
