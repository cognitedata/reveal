import uniq from 'lodash/uniq';

import { CogniteExternalId, Relationship } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

export const transformToRelatedResourceExternalIds = (
  relationships: Relationship[],
  resourceExternalId?: string
) => {
  const result: Record<ResourceType, CogniteExternalId[]> = {
    asset: [],
    timeSeries: [],
    file: [],
    event: [],
    sequence: [],
    threeD: [],
  };

  relationships.forEach(
    ({ sourceType, sourceExternalId, targetType, targetExternalId }) => {
      if (sourceExternalId !== resourceExternalId) {
        result[sourceType].push(sourceExternalId);
      }
      if (targetExternalId !== resourceExternalId) {
        result[targetType].push(targetExternalId);
      }
    }
  );

  return Object.entries(result).reduce((acc, [type, externalIds]) => {
    return {
      ...acc,
      [type]: uniq(externalIds),
    };
  }, {} as typeof result);
};
