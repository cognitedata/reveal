import uniq from 'lodash/uniq';

import { CogniteExternalId, Relationship } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

export const transformToRelatedResourceExternalIds = (
  relationships: Relationship[]
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
      result[sourceType].push(sourceExternalId);
      result[targetType].push(targetExternalId);
    }
  );

  return Object.entries(result).reduce((acc, [type, externalIds]) => {
    return {
      ...acc,
      [type]: uniq(externalIds),
    };
  }, {} as typeof result);
};
