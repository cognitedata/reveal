import { useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import { getAssetIdsCount } from '../network';

export const useAssetIdsCountQuery = ({
  resourceType,
  resourceId,
}: {
  resourceType: SdkResourceType;
  resourceId?: IdEither;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetIdsCount(resourceType, resourceId),
    () => {
      if (!resourceId) {
        return undefined;
      }
      return getAssetIdsCount(sdk, {
        resourceType,
        resourceId,
      });
    },
    {
      enabled: !!resourceId,
    }
  );
};
