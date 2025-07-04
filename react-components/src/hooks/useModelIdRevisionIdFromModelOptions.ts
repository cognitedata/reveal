import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';

import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { useMemo } from 'react';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getModelKeys } from '../utilities/getModelKeys';
import { queryKeys } from '../utilities/queryKeys';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined
): Array<AddModelOptions<ClassicDataSourceType>> => {
  const fdmSdk = useFdmSdk();

  const queriedAddModelOptions = useQueriedAddModelOptions(addModelOptionsArray, fdmSdk);

  return useMemo(() => {
    if (queriedAddModelOptions.data === undefined) {
      return [];
    }
    return queriedAddModelOptions.data;
  }, [queriedAddModelOptions]);
};

function useQueriedAddModelOptions(
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined,
  fdmSdk: FdmSDK
): UseQueryResult<Array<AddModelOptions<ClassicDataSourceType>>> {
  const keys = getModelKeys(addModelOptionsArray ?? []);

  return useQuery({
    queryKey: [queryKeys.modelRevisionId(keys)],
    queryFn: async () => {
      if (addModelOptionsArray === undefined || addModelOptionsArray.length === 0) {
        return [];
      }
      return await Promise.all(
        addModelOptionsArray.map(async (option) => await fetchClassicModelOption(option, fdmSdk))
      );
    },
    staleTime: Infinity
  });
}

async function fetchClassicModelOption(
  addModelOptions: AddModelOptions<DataSourceType>,
  fdmSdk: FdmSDK
): Promise<AddModelOptions<ClassicDataSourceType>> {
  if (isClassicIdentifier(addModelOptions)) {
    return addModelOptions;
  }
  if (isDM3DModelIdentifier(addModelOptions)) {
    const { modelId, revisionId } = await getModelIdAndRevisionIdFromExternalId(
      addModelOptions.revisionExternalId,
      addModelOptions.revisionSpace,
      fdmSdk
    );
    return {
      ...addModelOptions,
      modelId,
      revisionId
    };
  }
  throw new Error('Unknown identifier type');
}
