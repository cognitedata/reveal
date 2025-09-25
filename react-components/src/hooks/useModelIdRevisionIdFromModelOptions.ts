import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';

import { useContext, useMemo } from 'react';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { useQuery } from '@tanstack/react-query';
import { getModelKeys } from '../utilities/getModelKeys';
import { queryKeys } from '../utilities/queryKeys';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { ModelIdRevisionIdFromModelOptionsContext } from './useModelIdRevisionIdFromModelOptions.context';
import { AddCadResourceOptions, AddPointCloudResourceOptions } from '..';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddCadResourceOptions | AddPointCloudResourceOptions> | undefined
): Array<AddModelOptions<ClassicDataSourceType>> => {
  const { getModelIdAndRevisionIdFromExternalId, useFdmSdk } = useContext(
    ModelIdRevisionIdFromModelOptionsContext
  );
  const fdmSdk = useFdmSdk();
  const keys = getModelKeys(addModelOptionsArray ?? []);

  const queriedAddModelOptions = useQuery({
    queryKey: [queryKeys.modelRevisionId(keys)],
    queryFn: async () => {
      if (addModelOptionsArray === undefined || addModelOptionsArray.length === 0) {
        return [];
      }
      return await Promise.all(
        addModelOptionsArray.map(
          async (option) =>
            await fetchClassicModelOption(option, fdmSdk, getModelIdAndRevisionIdFromExternalId)
        )
      );
    },
    staleTime: Infinity
  });

  return useMemo(() => {
    if (queriedAddModelOptions.data === undefined) {
      return [];
    }
    return queriedAddModelOptions.data;
  }, [queriedAddModelOptions]);
};

async function fetchClassicModelOption(
  addModelOptions: AddCadResourceOptions | AddPointCloudResourceOptions,
  fdmSdk: FdmSDK,
  getModelIdAndRevisionIdFromExternalId: (
    revisionExternalId: string,
    revisionSpace: string,
    fdmSdk: FdmSDK
  ) => Promise<{ modelId: number; revisionId: number }>
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
