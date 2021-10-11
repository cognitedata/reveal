import groupBy from 'lodash/groupBy';

import { Metrics } from '@cognite/metrics';
import { Sequence, SequenceFilter } from '@cognite/sdk';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { LOG_WELLS_CASING_NAMESPACE } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { WellboreAssetIdMap } from 'modules/wellSearch/types';
import { filterValidCasings } from 'modules/wellSearch/utils/casings';
import { getWellboreAssetIdReverseMap } from 'modules/wellSearch/utils/common';

import { getChunkNumberList } from './common';

// refactor to use generic log fetcher.
export async function getCasingByWellboreIds(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  filter: SequenceFilter['filter'] = {},
  metric?: Metrics
) {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  let networkTimer;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_WELLS_CASING_NAMESPACE
    );
  }

  const idChunkList = getChunkNumberList(wellboreIds, 100);
  const casings = Promise.all(
    idChunkList.map((wellIdChunk: number[]) =>
      getCogniteSDKClient()
        .sequences.list({
          filter: {
            assetIds: wellIdChunk.map((id) => wellboreAssetIdMap[id]),
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

  const groupedData = groupBy(results, 'assetId');
  wellboreIds.forEach((wellboreId) => {
    groupedData[wellboreId] = filterValidCasings(groupedData[wellboreId] || []);
  });

  useStopTimeLogger(networkTimer, {
    noOfWellbores: wellboreIds.length,
  });

  return groupedData;
}
