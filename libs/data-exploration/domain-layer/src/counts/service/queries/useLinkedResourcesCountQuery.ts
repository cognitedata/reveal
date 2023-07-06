import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import { getLinkedResourcesCount } from '../network';

export const useLinkedResourcesCountQuery = ({
  resourceType,
  resourceId,
}: {
  resourceType: SdkResourceType;
  resourceId?: number;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.linkedResourcesCount(resourceType, resourceId),
    () => {
      if (!resourceId) {
        return undefined;
      }
      return getLinkedResourcesCount(sdk, {
        resourceType,
        resourceId,
      });
    },
    {
      enabled: !!resourceId,
    }
  );
};
