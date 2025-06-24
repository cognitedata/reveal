import { type UseQueryResult } from '@tanstack/react-query';
import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';

import { ModelIdRevisionIdFromModelOptionsContext } from './useModelIdRevisionIdFromModelOptions.context';
import { useContext } from 'react';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined
): Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>> => {
  const { useQueriedAddModelOptions, useFdmSdk } = useContext(
    ModelIdRevisionIdFromModelOptionsContext
  );
  const fdmSdk = useFdmSdk();

  const queriedAddModelOptions = useQueriedAddModelOptions(addModelOptionsArray, fdmSdk) ?? [];

  if (
    queriedAddModelOptions.some(
      (res) => res.isFetching || res.isLoading || res.isRefetching || res.isError
    )
  ) {
    return [];
  }
  return queriedAddModelOptions;
};
