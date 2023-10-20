import { useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import { getLinkedDocumentsCount, getLinkedResourcesCount } from '../network';

export const useLinkedResourcesCountQuery = ({
  resourceType,
  assetIds,
  linkedResourceIds,
  isDocumentsApiEnabled,
  enabled = true,
}: {
  resourceType: SdkResourceType;
  assetIds?: number[];
  linkedResourceIds?: IdEither[];
  isDocumentsApiEnabled: boolean;
  enabled?: boolean;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.linkedResourcesCount(resourceType, assetIds, linkedResourceIds),
    () => {
      if (!assetIds) {
        return undefined;
      }
      if (resourceType === 'files' && isDocumentsApiEnabled) {
        return getLinkedDocumentsCount(sdk, {
          assetIds,
          linkedResourceIds,
        });
      }
      return getLinkedResourcesCount(sdk, {
        resourceType,
        assetIds,
        linkedResourceIds,
      });
    },
    {
      enabled: enabled && !isEmpty(assetIds),
    }
  );
};
