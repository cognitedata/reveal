import { useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import {
  getDirectlyLinkedAssetsCount,
  getDirectlyLinkedDocumentsCount,
  getDirectlyLinkedResourcesCount,
} from '../network';

export const useDirectlyLinkedResourcesCountQuery = ({
  resourceType,
  assetIds,
  isDocumentsApiEnabled,
}: {
  resourceType: SdkResourceType;
  assetIds?: number[];
  isDocumentsApiEnabled: boolean;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.directlyLinkedResourcesCount(resourceType, assetIds),
    () => {
      if (!assetIds) {
        return undefined;
      }
      if (resourceType === 'assets') {
        return getDirectlyLinkedAssetsCount(sdk, {
          assetIds,
        });
      }
      if (resourceType === 'files' && isDocumentsApiEnabled) {
        return getDirectlyLinkedDocumentsCount(sdk, {
          assetIds,
        });
      }
      return getDirectlyLinkedResourcesCount(sdk, {
        resourceType,
        assetIds,
      });
    },
    {
      enabled: !isEmpty(assetIds),
    }
  );
};
