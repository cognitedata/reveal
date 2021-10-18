import { RawDB } from '@cognite/sdk';
import { useDatabaseList } from 'hooks';
import { UseQueryOptions } from 'react-query';

import { ErrorResponse } from 'utils/sdkSingleton';

export const useDatabaseListCount = (
  config?: UseQueryOptions<RawDB[], ErrorResponse>
) => {
  const { data, ...queryProps } = useDatabaseList(config);
  const count = queryProps.isFetched ? data?.length : undefined;

  return {
    ...queryProps,
    data: count,
  };
};
