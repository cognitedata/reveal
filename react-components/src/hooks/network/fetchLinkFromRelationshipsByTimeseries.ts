/*!
 * Copyright 2024 Cognite AS
 */

import { type CogniteClient, type RelationshipResourceType } from '@cognite/sdk';
import { type AssetAndTimeseriesIds } from '../../data-providers/types';
import { chunk } from 'lodash';
import { executeParallel } from '../../utilities/executeParallel';
import { getRelationships } from './getRelationships';
import { isDefined } from '../../utilities/isDefined';

const FETCH_RELATIONSHIP_CHUNK = 1000;

export const fetchLinkFromRelationshipsByTimeseries = async (
  sdk: CogniteClient,
  timeseriesExternalIds: string[],
  relationshipResourceTypes: RelationshipResourceType[]
): Promise<AssetAndTimeseriesIds[]> => {
  const timeseriesChunks = chunk(timeseriesExternalIds, FETCH_RELATIONSHIP_CHUNK);

  const dataRelationship = await executeParallel(
    timeseriesChunks.map(
      (timeseriesIds) => async () =>
        await getRelationships(sdk, {
          resourceExternalIds: timeseriesIds,
          relationshipResourceTypes
        })
    ),
    2
  );

  const cleanDataRelationship = dataRelationship.filter(isDefined).flat();

  const assetAndTimeseriesIdsFromRelationship =
    cleanDataRelationship?.map((item) => {
      const assetAndTimeseriesIds: AssetAndTimeseriesIds = {
        assetIds: { externalId: '' },
        timeseriesIds: { externalId: '' }
      };

      if (item.sourceType === 'asset') {
        assetAndTimeseriesIds.assetIds.externalId = item.sourceExternalId;
      } else if (item.targetType === 'asset') {
        assetAndTimeseriesIds.assetIds.externalId = item.targetExternalId;
      }

      if (item.sourceType === 'timeSeries') {
        assetAndTimeseriesIds.timeseriesIds.externalId = item.sourceExternalId;
      } else if (item.targetType === 'timeSeries') {
        assetAndTimeseriesIds.timeseriesIds.externalId = item.targetExternalId;
      }

      return assetAndTimeseriesIds;
    }) ?? [];

  return assetAndTimeseriesIdsFromRelationship;
};
