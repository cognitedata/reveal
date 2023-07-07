import { useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import { getLinkedDocumentsCount, getLinkedResourcesCount } from '../network';

export const useLinkedResourcesCountQuery = ({
  resourceType,
  resourceId,
  linkedResourceIds,
  isDocumentsApiEnabled,
}: {
  resourceType: SdkResourceType;
  resourceId?: IdEither;
  linkedResourceIds?: IdEither[];
  isDocumentsApiEnabled: boolean;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.linkedResourcesCount(resourceType, resourceId, linkedResourceIds),
    () => {
      if (!resourceId) {
        return undefined;
      }
      if (resourceType === 'files' && isDocumentsApiEnabled) {
        return getLinkedDocumentsCount(sdk, {
          resourceId,
          linkedResourceIds,
        });
      }
      return getLinkedResourcesCount(sdk, {
        resourceType,
        resourceId,
        linkedResourceIds,
      });
    },
    {
      enabled: !!resourceId,
    }
  );
};
