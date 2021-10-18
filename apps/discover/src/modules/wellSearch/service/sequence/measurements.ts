import groupBy from 'lodash/groupBy';

import { Metrics } from '@cognite/metrics';
import { Sequence } from '@cognite/sdk';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { LOG_WELLS_MEASUREMENTS_NAMESPACE } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { Measurement, WellboreAssetIdMap } from 'modules/wellSearch/types';
import { getWellboreAssetIdReverseMap } from 'modules/wellSearch/utils/common';
import { SequenceFetcher, WellConfig } from 'tenants/types';

import { getChunkNumberList } from './common';

// refactor to use generic log fetcher.
export async function getMeasurementsByWellboreIds(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  config?: WellConfig,
  metric?: Metrics
) {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  let networkTimer;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_WELLS_MEASUREMENTS_NAMESPACE
    );
  }

  const idChunkList = getChunkNumberList(wellboreIds, 100);

  const promises: Promise<Sequence[]>[] = [];

  const dataTypes: (keyof WellConfig)[] = ['geomechanic', 'ppfg', 'fit', 'lot'];

  idChunkList.forEach((wellIdChunk: number[]) => {
    dataTypes.forEach((dataType) => {
      const moduleConfig = config?.[dataType] as {
        enabled: boolean;
        fetch?: SequenceFetcher;
      };
      if (moduleConfig.enabled && moduleConfig.fetch) {
        const fetcher = moduleConfig.fetch;
        promises.push(
          fetcher(getCogniteSDKClient(), {
            assetIds: wellIdChunk.map((id) => wellboreAssetIdMap[id]),
          }).then((response) =>
            response.map((item) => ({
              ...item,
              assetId: wellboreAssetIdReverseMap[item.assetId as number],
              metadata: {
                ...item.metadata,
                dataType: dataType as string,
              },
            }))
          )
        );
      }
    });
  });

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
      groupedData[wellboreId] = [];
    }
  });

  useStopTimeLogger(networkTimer, {
    noOfWellbores: wellboreIds.length,
  });

  return groupedData;
}
