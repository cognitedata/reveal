import { ITimer, Metrics } from '@cognite/metrics';
import { CogniteEvent } from '@cognite/sdk';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { LOG_EVENTS_NDS } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import {
  Wellbore,
  EventsType,
  WellboreAssetIdMap,
} from 'modules/wellSearch/types';
import { getWellboreAssetIdReverseMap } from 'modules/wellSearch/utils/common';

import { getChunkNumberList } from '../sequence/common';

import {
  EVENT_LIMIT,
  EVENT_PER_PAGE,
  getFilterQueryForEvents,
  groupEventsByAssetId,
} from './common';

/**
 * This was used while doing the data extraction for the temporary filtering solution and will be removed soon
 */
export async function loadAllNdsEvents(
  wellbores: Wellbore[],
  eventType: EventsType
) {
  const wellboresIdList = wellbores.map((wellbore) => wellbore.id);
  /**
   * Only 100 assetids are alowed in sequence query.
   * Hence wellbores id list is broken in to 100 pieces.
   */

  const wellboresIdChunkList = getChunkNumberList(wellboresIdList, 100);

  const events = Promise.all(
    wellboresIdChunkList.map((wellboresIdChunk: number[]) =>
      getCogniteSDKClient()
        .events.list({
          filter: {
            assetIds: wellboresIdChunk,
            ...getFilterQueryForEvents(eventType),
          },
          limit: EVENT_PER_PAGE,
        })
        .autoPagingToArray({ limit: Infinity })
    )
  );
  return ([] as any[]).concat(...(await events));
}

export function getNdsEventsByWellboreIds(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  metric?: Metrics
) {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  const body = {
    filter: {
      assetIds: wellboreIds.map((id) => wellboreAssetIdMap[id]),
      source: 'NDS',
      metadata: {
        type: 'Risk',
      },
    },
    limit: EVENT_PER_PAGE,
  };
  let networkTimer: ITimer | undefined;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_EVENTS_NDS
    );
  }
  return getCogniteSDKClient()
    .events.list(body)
    .autoPagingToArray({ limit: EVENT_LIMIT })
    .then((response) => {
      const events: CogniteEvent[] = response
        .filter((event) => (event.assetIds || []).length)
        .map((event) => ({
          ...event,
          assetIds: event.assetIds?.map(
            (assetId) => wellboreAssetIdReverseMap[assetId]
          ),
        }));
      const groupedEvents = groupEventsByAssetId(events);

      wellboreIds.forEach((wellboreId) => {
        if (!groupedEvents[wellboreId]) {
          groupedEvents[wellboreId] = [];
        }
      });
      return groupedEvents;
    })
    .finally(() => {
      useStopTimeLogger(networkTimer, {
        noOfWellbores: wellboreIds.length,
      });
    });
}
