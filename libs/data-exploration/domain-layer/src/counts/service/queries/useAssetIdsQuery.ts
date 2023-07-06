import { useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { queryKeys } from '../../../queryKeys';
import { getAssetIds, getDocumentAssetIds } from '../network';

export const useAssetIdsQuery = ({
  resourceType,
  resourceId,
  isDocumentsApiEnabled,
}: {
  resourceType: SdkResourceType;
  resourceId?: IdEither;
  isDocumentsApiEnabled: boolean;
}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetIdsCount(resourceType, resourceId),
    () => {
      if (!resourceId) {
        return undefined;
      }
      if (resourceType === 'files' && isDocumentsApiEnabled) {
        return getDocumentAssetIds(sdk, { resourceId });
      }
      return getAssetIds(sdk, {
        resourceType,
        resourceId,
      });
    },
    {
      enabled: !!resourceId,
    }
  );
};
