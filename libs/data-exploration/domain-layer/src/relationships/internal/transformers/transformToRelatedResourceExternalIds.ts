import uniq from 'lodash/uniq';

import { CogniteExternalId } from '@cognite/sdk';

import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { ExtendedRelationship } from '../../service';

export const transformToRelatedResourceExternalIds = (
  relationships: ExtendedRelationship[]
) => {
  const result: Record<ResourceType, CogniteExternalId[]> = {
    [ResourceTypes.Asset]: [],
    [ResourceTypes.Event]: [],
    [ResourceTypes.TimeSeries]: [],
    [ResourceTypes.Sequence]: [],
    [ResourceTypes.File]: [],
    [ResourceTypes.ThreeD]: [],
    [ResourceTypes.Charts]: [],
  };

  relationships.forEach(
    ({
      relation,
      sourceType,
      sourceExternalId,
      targetType,
      targetExternalId,
    }) => {
      if (relation === 'Source') {
        result[sourceType].push(sourceExternalId);
      } else {
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
