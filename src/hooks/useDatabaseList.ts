import { RawDB } from '@cognite/sdk';
import { UseQueryOptions, useQuery } from 'react-query';

import sdk, { ErrorResponse } from 'utils/sdkSingleton';

import { getRawExplorerQueryKey } from './keys';

export const useDatabaseList = (
  config?: UseQueryOptions<RawDB[], ErrorResponse>
) => {
  return useQuery<RawDB[], ErrorResponse>(
    getRawExplorerQueryKey('list', 'databases'),
    () => sdk.raw.listDatabases().autoPagingToArray({ limit: -1 }),
    config
  );
};
