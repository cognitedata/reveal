import groupBy from 'lodash/groupBy';
import noop from 'lodash/noop';
import set from 'lodash/set';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { ProjectConfigWells } from '@cognite/discover-api-types';
import { Sequence } from '@cognite/sdk';

import { MetricLogger } from 'hooks/useTimeLog';
import { Measurement, WellboreAssetIdMap } from 'modules/wellSearch/types';
import { getWellboreAssetIdReverseMap } from 'modules/wellSearch/utils/common';

import { getChunkNumberList } from './common';

// refactor to use generic log fetcher.
export async function getMeasurementsByWellboreIds(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  config?: ProjectConfigWells,
  metricLogger: MetricLogger = [noop, noop]
) {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);

  const [startNetworkTimer, stopNetworkTimer] = metricLogger;

  startNetworkTimer();

  const idChunkList = getChunkNumberList(wellboreIds, 100);

  const promises: Promise<Sequence[]>[] = [];

  const dataTypes: (keyof ProjectConfigWells)[] = [
    'geomechanic',
    'ppfg',
    'fit',
    'lot',
  ];
  const moduleConfig = config?.measurements;

  if (moduleConfig?.enabled && moduleConfig?.metadata) {
    idChunkList.forEach((wellIdChunk: number[]) => {
      const baseFilters = {
        assetIds: wellIdChunk.map((id) => wellboreAssetIdMap[id]),
      };
      dataTypes.forEach((dataType) => {
        const dataTypeFilter = moduleConfig.metadata[dataType];
        if (dataTypeFilter) {
          promises.push(
            getCogniteSDKClient()
              .sequences.search({
                ...dataTypeFilter,
                filter: {
                  ...dataTypeFilter.filter,
                  ...baseFilters,
                },
              })
              .then((sequences) =>
                processSequenceResponse(
                  sequences,
                  wellboreAssetIdReverseMap,
                  dataType
                )
              )
          );
        }
      });
    });
  }

  const results = ([] as Measurement[]).concat(
    ...(await Promise.all(promises))
  );

  const rowsPromises: Promise<void>[] = [];
  results.forEach((sequence) => {
    rowsPromises.push(
      getCogniteSDKClient()
        .sequences.retrieveRows({
          id: sequence.id,
          start: 0,
          end: 1000,
          limit: 1000,
        })
        .autoPagingToArray({ limit: 1000 })
        .then((response) => {
          // eslint-disable-next-line no-param-reassign
          sequence.rows = response;
        })
    );
  });

  await Promise.all(rowsPromises);

  const groupedData = groupBy(results, 'assetId');
  wellboreIds.forEach((wellboreId) => {
    if (!groupedData[wellboreId]) {
      set(groupedData, wellboreId, []);
    }
  });

  stopNetworkTimer({
    noOfWellbores: wellboreIds.length,
  });

  return groupedData;
}

export const processSequenceResponse = (
  sequences: Sequence[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  dataType: string
) => {
  return sequences
    .filter((sequence) => cleanPpfgResults(sequence, dataType))
    .map((sequence) => ({
      ...sequence,
      assetId: wellboreAssetIdMap[sequence.assetId as number],
      metadata: {
        ...sequence.metadata,
        dataType,
      },
    }));
};

/**
 * Filter out sequences if metadata description doesn't includes `ppfg`
 */
export const cleanPpfgResults = (sequence: Sequence, dataType: string) => {
  if (dataType !== 'ppfg') return true;
  return sequence.columns.some(
    (column) =>
      column.metadata &&
      column.metadata.description.toLowerCase().includes(dataType)
  );
};
