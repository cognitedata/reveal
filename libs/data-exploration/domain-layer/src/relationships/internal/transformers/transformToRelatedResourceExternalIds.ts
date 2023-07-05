import uniq from 'lodash/uniq';

import {
  CogniteExternalId,
  Relationship,
  RelationshipResourceType,
} from '@cognite/sdk';

export const transformToRelatedResourceExternalIds = (
  relationships: Relationship[]
) => {
  const result: Record<RelationshipResourceType, CogniteExternalId[]> = {
    asset: [],
    timeSeries: [],
    file: [],
    event: [],
    sequence: [],
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
  }, {} as Record<RelationshipResourceType, CogniteExternalId[]>);
};
