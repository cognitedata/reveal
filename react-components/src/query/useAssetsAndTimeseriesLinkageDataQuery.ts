import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import {
  type Asset,
  type ExternalId,
  type IdEither,
  type InternalId,
  type Timeseries,
  type CogniteExternalId,
  type RelationshipResourceType,
  type CogniteClient
} from '@cognite/sdk';

import { getRelationships } from '../hooks/network/getRelationships';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import {
  type AssetIdsAndTimeseries,
  type AssetAndTimeseriesIds,
  type AssetIdsAndTimeseriesData
} from '../data-providers/types';
import { queryKeys } from '../utilities/queryKeys';
import { getTimeseriesByIds } from '../hooks/network/getTimeseriesByIds';
import { isDefined } from '../utilities/isDefined';
import { getAssetsByIds } from '../hooks/network/getAssetsByIds';
import { getTimeseriesLatestDatapoints } from '../hooks/network/getTimeseriesLatestDatapoints';
import { chunk, uniqBy } from 'lodash';
import { executeParallel } from '../utilities/executeParallel';

const FETCH_RELATIONSHIP_CHUNK = 1000;

type Props = {
  timeseriesExternalIds: CogniteExternalId[];
  assetNodes: Asset[];
};

export function useAssetsAndTimeseriesLinkageDataQuery({
  timeseriesExternalIds,
  assetNodes
}: Props): UseQueryResult<AssetIdsAndTimeseriesData, unknown> {
  const sdk = useSDK();

  const relationshipResourceTypes: RelationshipResourceType[] = ['asset'];

  return useQuery({
    queryKey: [
      queryKeys.timeseriesLinkedToAssets(),
      timeseriesExternalIds,
      relationshipResourceTypes
    ],
    queryFn: async () => {
      const externalIds: ExternalId[] = timeseriesExternalIds.map((externalId) => {
        return {
          externalId
        };
      });

      const [assetAndTimeseriesIdsFromRelationship, timeseries, timeseriesDatapoints] =
        await Promise.all([
          getLinkFromRelationships(sdk, timeseriesExternalIds, relationshipResourceTypes),
          getTimeseriesByIds(sdk, externalIds),
          getTimeseriesLatestDatapoints(sdk, externalIds)
        ]);

      const assetIdsFound: IdEither[] =
        timeseries
          ?.map((timeseries) => {
            return getAssetIdsFromTimeseries(
              assetNodes,
              timeseries,
              assetAndTimeseriesIdsFromRelationship
            );
          })
          .flat()
          .filter(isDefined) ?? [];

      const uniqueAssetIds = uniqBy(assetIdsFound, 'externalId');

      const assetFromTimeseries =
        assetIdsFound.length > 0 ? await getAssetsByIds(sdk, uniqueAssetIds) : [];

      const assetIdsWithTimeseries =
        timeseries
          ?.map((timeseries): AssetIdsAndTimeseries[] | undefined => {
            return generateAssetAndTimeseries(
              assetFromTimeseries,
              timeseries,
              assetAndTimeseriesIdsFromRelationship
            );
          })
          .flat()
          .filter(isDefined) ?? [];

      const assetIdsAndTimeseriesData: AssetIdsAndTimeseriesData = {
        assetIdsWithTimeseries,
        timeseriesDatapoints
      };
      return assetIdsAndTimeseriesData;
    },
    enabled: timeseriesExternalIds.length > 0
  });
}

const getLinkFromRelationships = async (
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

const getAssetIdsFromTimeseries = (
  contextualizedAssetNodes: Array<Asset & InternalId>,
  timeseries: Timeseries,
  assetAndTimeseriesIdsFromRelationship: AssetAndTimeseriesIds[] | undefined
): Array<ExternalId | undefined> | undefined => {
  const assetFoundFromTimeseries = contextualizedAssetNodes.find(
    (asset) => asset.id === timeseries.assetId
  );

  const assetIdFromTimeseries: ExternalId | undefined =
    assetFoundFromTimeseries?.externalId !== undefined
      ? {
          externalId: assetFoundFromTimeseries.externalId
        }
      : undefined;

  const itemsFromRelationship = assetAndTimeseriesIdsFromRelationship?.filter(
    (item) =>
      item.timeseriesIds.externalId === timeseries.externalId &&
      item.assetIds.externalId !== assetIdFromTimeseries?.externalId
  );

  const assetIdsFromRelationship = itemsFromRelationship?.map((item) => {
    const itemFound: ExternalId | undefined =
      item.assetIds.externalId !== undefined ? { externalId: item.assetIds.externalId } : undefined;
    return itemFound;
  });

  const assetIdsFromTimeseriesAndRelationship = assetIdsFromRelationship
    ?.concat(assetIdFromTimeseries)
    .filter(isDefined);

  return assetIdsFromTimeseriesAndRelationship;
};

const generateAssetAndTimeseries = (
  assetFromTimeseries: Array<Asset & InternalId> | undefined,
  timeseries: Timeseries,
  assetAndTimeseriesIdsFromRelationship: AssetAndTimeseriesIds[] | undefined
): AssetIdsAndTimeseries[] => {
  const linkedAsset = assetFromTimeseries?.find((asset) => asset.id === timeseries.assetId);
  const assetIds: Partial<ExternalId & InternalId> | undefined =
    linkedAsset !== undefined
      ? { externalId: linkedAsset.externalId, id: linkedAsset.id }
      : undefined;

  const assetAndTimeseriesFromLinked: AssetIdsAndTimeseries | undefined =
    assetIds !== undefined
      ? {
          assetIds,
          timeseries
        }
      : undefined;

  const itemsFromRelationship = assetAndTimeseriesIdsFromRelationship?.filter(
    (item) =>
      item.timeseriesIds.externalId === timeseries.externalId &&
      item.assetIds.externalId !== linkedAsset?.externalId
  );

  const assetAndTimeseriesFromAll: AssetIdsAndTimeseries[] =
    itemsFromRelationship?.map((item) => {
      const itemFound: AssetIdsAndTimeseries = {
        assetIds: item.assetIds,
        timeseries
      };
      return itemFound;
    }) ?? [];

  if (assetAndTimeseriesFromLinked !== undefined) {
    assetAndTimeseriesFromAll.push(assetAndTimeseriesFromLinked);
  }

  return assetAndTimeseriesFromAll;
};
