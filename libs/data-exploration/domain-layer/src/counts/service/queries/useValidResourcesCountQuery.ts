import { useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import { getValidDocumentsCount, getValidResourcesCount } from '../network';

export const useValidResourcesCountQuery = ({
  resourceType,
  resourceIds,
  isDocumentsApiEnabled,
}: {
  resourceType: SdkResourceType;
  resourceIds: IdEither[];
  isDocumentsApiEnabled: boolean;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.validResourcesCount(resourceType, resourceIds),
    () => {
      if (resourceType === 'files' && isDocumentsApiEnabled) {
        return getValidDocumentsCount(sdk, {
          resourceIds,
        });
      }
      return getValidResourcesCount(sdk, {
        resourceType,
        resourceIds,
      });
    },
    {
      enabled: !!resourceIds.length,
    }
  );
};
