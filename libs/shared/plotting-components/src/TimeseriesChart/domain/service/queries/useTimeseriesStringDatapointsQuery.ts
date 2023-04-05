import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { StringDatapoint } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';
import { StringDatapointsQuery } from '../types';
import { getTimeseriesStringDatapoints } from '../network/getTimeseriesStringDatapoints';

export const useTimeseriesStringDatapointsQuery = (
  query: StringDatapointsQuery,
  enabled?: boolean
): UseQueryResult<StringDatapoint[]> => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.stringDatapoints(query),
    () => {
      return getTimeseriesStringDatapoints(sdk, query).catch(() => {
        return [] as StringDatapoint[];
      });
    },
    { enabled }
  );
};
