import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type AddModelOptions,
  type ClassicDataSourceType,
  type DataSourceType
} from '@cognite/reveal';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { getModelKeys } from '../utilities/getModelKeys';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { queryKeys } from '../utilities/queryKeys';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';

export function useQueriedAddModelOptions(
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
        addModelOptionsArray.map(async (addModelOptions) => {
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
        })
      );
    },
    staleTime: Infinity
  });
}
