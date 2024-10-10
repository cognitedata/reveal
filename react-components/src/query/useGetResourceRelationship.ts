/*!
 * Copyright 2024 Cognite AS
 */
import { type RelationshipResourceType } from '@cognite/sdk';
import { getRelationships } from '../hooks/network/getRelationships';
import { type ExtendedRelationship } from '../data-providers/types';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { useMemo } from 'react';

export const useGetResourceRelationship = async (
  resourceIds: string[],
  resourceTypes: RelationshipResourceType[]
): Promise<ExtendedRelationship[]> => {
  const sdk = useSDK();

  const result = useMemo(async () => {
    if (resourceIds.length === 0 || resourceIds.filter((id) => id.length > 0).length === 0) {
      return [];
    }
    return await getRelationships(sdk, {
      resourceExternalIds: resourceIds,
      relationshipResourceTypes: resourceTypes
    });
  }, [resourceIds, resourceTypes]);

  return await result;
};
