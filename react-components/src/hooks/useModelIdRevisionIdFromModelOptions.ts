import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';

import { ModelIdRevisionIdFromModelOptionsContext } from './useModelIdRevisionIdFromModelOptions.context';
import { useContext, useMemo } from 'react';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined
): Array<AddModelOptions<ClassicDataSourceType>> => {
  const { useQueriedAddModelOptions, useFdmSdk } = useContext(
    ModelIdRevisionIdFromModelOptionsContext
  );
  const fdmSdk = useFdmSdk();

  const queriedAddModelOptions = useQueriedAddModelOptions(addModelOptionsArray, fdmSdk);

  return useMemo(() => {
    if (queriedAddModelOptions.data === undefined) {
      return [];
    }
    return queriedAddModelOptions.data;
  }, [queriedAddModelOptions]);
};
