import { useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getLinkedDocumentsCount } from '../network';

export const useLinkedDocumentsCountQuery = (
  resourceId?: IdEither,
  enabled = true
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.linkedResourcesCount('files', resourceId),
    () => {
      if (!resourceId) {
        return undefined;
      }

      return getLinkedDocumentsCount(sdk, { resourceId });
    },
    {
      enabled: enabled && !!resourceId,
    }
  );
};
