import { type UseQueryResult } from '@tanstack/react-query';
import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';

import { ModelIdRevisionIdFromModelOptionsContext } from './useModelIdRevisionIdFromModelOptions.context';
import { useContext, useRef } from 'react';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined
): Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>> => {
  const { useQueriedAddModelOptions, useFdmSdk } = useContext(
    ModelIdRevisionIdFromModelOptionsContext
  );
  const fdmSdk = useFdmSdk();

  const lastStable = useRef<Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>>>([]);

  const queriedAddModelOptions = useQueriedAddModelOptions(addModelOptionsArray, fdmSdk) ?? [];

  // We don't want to return a partial result if any of the queries that are still loading, fetching, refetching, or errored.
  if (
    queriedAddModelOptions.some(
      (res) => res.isFetching || res.isLoading || res.isRefetching || res.isError
    )
  ) {
    return [];
  }

  // Logic for ensuring that we return a stable reference. Only comparing data as that's what we care about
  const isSame =
    lastStable.current.length === queriedAddModelOptions.length &&
    lastStable.current.every((item, idx) => item.data === queriedAddModelOptions[idx].data);

  if (!isSame) {
    lastStable.current = queriedAddModelOptions;
  }

  return lastStable.current;
};
