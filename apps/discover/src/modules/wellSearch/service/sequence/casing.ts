import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import max from 'lodash/max';
import min from 'lodash/min';
import noop from 'lodash/noop';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { Sequence, SequenceColumn, SequenceFilter } from '@cognite/sdk';
import { CasingAssembly, CasingItems } from '@cognite/sdk-wells-v3';

import { MetricLogger } from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import {
  WellboreAssetIdMap,
  WellboreId,
  WellboreSourceExternalIdMap,
} from 'modules/wellSearch/types';
import { filterValidCasings } from 'modules/wellSearch/utils/casings';
import { getWellboreAssetIdReverseMap } from 'modules/wellSearch/utils/common';

import { CASINGS_COLUMN_NAME_MAP, SEQUENCE_COLUMNS } from './constants';

const CHUNK_LIMIT = 100;

// refactor to use generic log fetcher.
export async function getCasingByWellboreIds(
  wellboreIds: WellboreId[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  filter: SequenceFilter['filter'] = {},
  metricLogger: MetricLogger = [noop, noop],
  enableWellSDKV3?: boolean
) {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;
  startNetworkTimer();

  const casingsData = enableWellSDKV3
    ? await fetchCasingsUsingWellsSDK(wellboreIds, wellboreSourceExternalIdMap)
    : await fetchCasingsUsingCogniteSDK(
        wellboreIds,
        wellboreAssetIdMap,
        filter
      );

  stopNetworkTimer({
    noOfWellbores: wellboreIds.length,
  });

  return casingsData;
}

export const fetchCasingsUsingWellsSDK = async (
  wellboreIds: WellboreId[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const idChunkList = chunk(wellboreIds, CHUNK_LIMIT);
  const casings = flatten(
    await Promise.all(
      idChunkList.map((wellboreIdChunk) =>
        getWellSDKClient()
          .casings.list({
            filter: { wellboreIds: wellboreIdChunk.map(toIdentifier) },
            limit: CHUNK_LIMIT,
          })
          .then((casingItems) =>
            mapCasingItemsToSequences(casingItems, wellboreSourceExternalIdMap)
          )
      )
    )
  );

  return groupBy(casings, 'assetId');
};

export const mapCasingItemsToSequences = (
  casingItems: CasingItems,
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  return casingItems.items.map((casingSchematic) => {
    return {
      id: Number(uniqueId()),
      columns: getCasingsColumns(casingSchematic.casingAssemblies[0]),
      assetId:
        wellboreSourceExternalIdMap[casingSchematic.wellboreAssetExternalId],
      name: casingSchematic.source.sourceName,
      externalId: casingSchematic.wellboreAssetExternalId,
      metadata: getSequenceMetadata(casingSchematic.casingAssemblies),
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    } as Sequence;
  });
};

export const getCasingsColumns = (casingAssembly: CasingAssembly) => {
  const groupedColumns = groupBy(SEQUENCE_COLUMNS, 'name');

  return Object.keys(CASINGS_COLUMN_NAME_MAP).map((columnName) => {
    const casingAssemblyKey = get(
      CASINGS_COLUMN_NAME_MAP,
      columnName
    ) as keyof CasingAssembly;
    const casingAssemblyData = casingAssembly[casingAssemblyKey];

    return {
      ...get(groupedColumns, columnName)[0],
      metadata: { unit: get(casingAssemblyData, 'unit') },
    } as SequenceColumn;
  });
};

export const getSequenceMetadata = (casingAssemblies: CasingAssembly[]) => {
  const mdBases: number[] = [];
  const mdTops: number[] = [];
  const maxOutsideDiameters: number[] = [];
  const minInsideDiameters: number[] = [];
  const casingTypes: string[] = [];

  casingAssemblies.forEach((casingAssembly) => {
    mdBases.push(casingAssembly.originalMeasuredDepthBase.value);
    mdTops.push(casingAssembly.originalMeasuredDepthTop.value);
    maxOutsideDiameters.push(casingAssembly.maxOutsideDiameter.value);
    minInsideDiameters.push(casingAssembly.minInsideDiameter.value);

    if (casingAssembly.type) {
      casingTypes.push(casingAssembly.type);
    }
  });

  return {
    assy_original_md_base: String(max(mdBases)),
    assy_name: uniq(casingTypes).join(', '),
    assy_original_md_top: String(max(mdTops)),
    assy_size: String(max(maxOutsideDiameters)),
    assy_min_inside_diameter: String(min(minInsideDiameters)),
  };
};

export const fetchCasingsUsingCogniteSDK = async (
  wellboreIds: WellboreId[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  filter: SequenceFilter['filter'] = {}
) => {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  const idChunkList = chunk(wellboreIds, CHUNK_LIMIT);

  const casings = Promise.all(
    idChunkList.map((wellboreIdChunk) =>
      getCogniteSDKClient()
        .sequences.list({
          filter: {
            assetIds: wellboreIdChunk.map((id) => wellboreAssetIdMap[id]),
            ...filter,
          },
        })
        .then((list) =>
          list.items.map((item) => ({
            ...item,
            assetId: wellboreAssetIdReverseMap[item.assetId as number],
          }))
        )
    )
  );

  const results = ([] as Sequence[]).concat(...(await casings));

  return getGroupedSequenceData(results, wellboreIds);
};

export const getGroupedSequenceData = (
  data: Sequence[],
  wellboreIds: WellboreId[]
) => {
  const groupedData: Record<string, Sequence[]> = groupBy(data, 'assetId');
  wellboreIds.forEach((wellboreId) => {
    const isValid = filterValidCasings(groupedData[wellboreId] || []);
    groupedData[wellboreId] = isValid;
  });
  return groupedData;
};
