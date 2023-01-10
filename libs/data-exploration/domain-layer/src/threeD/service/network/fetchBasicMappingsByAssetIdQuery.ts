import { CogniteClient, CogniteError } from '@cognite/sdk';
import { FetchQueryOptions, QueryClient } from 'react-query';

import {
  BasicMapping,
  getBasicMappingsByAssetId,
} from '@data-exploration-lib/domain-layer';
import { queryKeys } from '@data-exploration-lib/domain-layer';

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
