import groupBy from 'lodash/groupBy';

import { Metrics } from '@cognite/metrics';
import { SequenceFilter } from '@cognite/sdk';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { LOG_WELLS_TRAJECTORY_NAMESPACE } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import {
  SequenceRow,
  TrajectoryColumnR,
  TrajectoryData,
  Wellbore,
  WellboreAssetIdMap,
} from 'modules/wellSearch/types';
import { getWellboreAssetIdReverseMap } from 'modules/wellSearch/utils/common';
import {
  getExistColumns,
  mapDataToTrajectoryRowType,
} from 'modules/wellSearch/utils/trajectory';

import { getChunkNumberList } from './common';

const CHUNK_LIMIT = 100;

export async function getTrajectoriesByWellboreIds(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  sequenceFilter: SequenceFilter = {},
  columns: TrajectoryColumnR[] = [],
  metric?: Metrics
) {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  let networkTimer;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_WELLS_TRAJECTORY_NAMESPACE
    );
  }
  const idChunkList = getChunkNumberList(wellboreIds, CHUNK_LIMIT);
  const sequences = Promise.all(
    idChunkList.map((idChunk: number[]) =>
      getCogniteSDKClient()
        .sequences.list({
          filter: {
            assetIds: idChunk.map((id) => wellboreAssetIdMap[id]),
            ...sequenceFilter.filter,
          },
        })
        .then((list) => {
          return Promise.all(
            list.items.map((sequence) => {
              const existColumns = getExistColumns(sequence, columns);
              return getTrajectoryDataById(
                sequence.id,
                existColumns.map((col) => col.name)
              ).then((rowData) => {
                const convertedRowData = mapDataToTrajectoryRowType(
                  sequence,
                  rowData,
                  existColumns
                );
                return {
                  sequence: {
                    ...sequence,
                    assetId:
                      wellboreAssetIdReverseMap[sequence.assetId as number],
                  },
                  rowData: {
                    ...convertedRowData,
                    wellboreId:
                      wellboreAssetIdReverseMap[convertedRowData.wellboreId],
                  },
                };
              });
            })
          );
        })
    )
  );
  const results = ([] as TrajectoryData[]).concat(...(await sequences));

  const groupedData = groupBy(results, 'sequence.assetId');
  wellboreIds.forEach((wellboreId) => {
    groupedData[wellboreId] = groupedData[wellboreId] || [];
  });

  useStopTimeLogger(networkTimer, {
    noOfWellbores: wellboreIds.length,
  });

  return groupedData;
}

export function getTrajectoryDataById(
  trajId: number,
  columns: string[]
): Promise<SequenceRow[]> {
  return (
    getCogniteSDKClient()
      .sequences.retrieveRows({
        id: trajId,
        start: 0,
        end: 1000,
        limit: 1000,
        columns,
      })
      .autoPagingToArray({ limit: 1000 })
      // .then((list) => {
      //   console.log('list', list);
      //   return list;
      // })
      .catch((error) => {
        console.error('error', error);
        return [];
      })
  );
}

// utils:

export async function loadTrajectories(wellbores: Wellbore[]) {
  const wellboresIdList = wellbores.map((wellbore) => wellbore.id);
  /**
   * Only 100 assetids are alowed in sequence query.
   * Hence wellbores id list is broken in to 100 pieces.
   */

  const wellboresIdChunkList = getChunkNumberList(wellboresIdList, 100);

  const trajectories = Promise.all(
    wellboresIdChunkList.map((wellboresIdChunk: number[]) =>
      getCogniteSDKClient()
        .sequences.list({
          filter: {
            metadata: {
              type: 'Trajectory',
              object_state: 'ACTUAL',
            },
            assetIds: wellboresIdChunk,
          },
          limit: 1000,
        })
        .autoPagingToArray({ limit: Infinity })
    )
  );
  return ([] as any[]).concat(...(await trajectories));
}
