import { CogniteClient, CogniteError } from '@cognite/sdk';
import { FetchQueryOptions, QueryClient } from 'react-query';

import { BasicMapping, getBasicMappingsByAssetId } from 'domain/threeD';
import { queryKeys } from 'domain/queryKeys';

export const fetchBasicMappingsByAssetIdQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  assetId: number,
  options?: FetchQueryOptions<BasicMapping[], CogniteError, BasicMapping[]>
) => {
  return queryClient.fetchQuery<BasicMapping[], CogniteError, BasicMapping[]>(
    queryKeys.listBasicAssetMappings(assetId),
    () => getBasicMappingsByAssetId(sdk, { assetId }),
    options
  );
};
