import { FdmMixerApiService } from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useDataModels = () => {
  const sdk = useSDK();
  return useQuery(['data-models'], () => {
    return new FdmMixerApiService(sdk).listDataModelVersions();
  });
};
export const useDataModel = (space?: string, externalId?: string) => {
  const sdk = useSDK();
  return useQuery(
    ['data-model', space, externalId],
    () => {
      return new FdmMixerApiService(sdk).getDataModelVersionsById(
        space!,
        externalId!
      );
    },
    { enabled: !!space && !!externalId }
  );
};
