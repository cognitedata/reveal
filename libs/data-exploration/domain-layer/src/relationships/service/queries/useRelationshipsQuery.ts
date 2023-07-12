import { useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { CogniteExternalId, RelationshipResourceType } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getRelationships } from '../network';

export const useRelationshipsQuery = (
  resourceExternalIds: CogniteExternalId[],
  relationshipResourceTypes: RelationshipResourceType[]
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.resourceRelationships(
      resourceExternalIds,
      relationshipResourceTypes
    ),
    () => {
      return getRelationships(sdk, {
        resourceExternalIds,
        relationshipResourceTypes,
      });
    },
    {
      enabled:
        !isEmpty(resourceExternalIds) && !isEmpty(relationshipResourceTypes),
    }
  );
};
