import groupBy from 'lodash/groupBy';

import { ITimer, Metrics } from '@cognite/metrics';

import { LOG_EVENTS_NDS } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { getNPTItems } from 'modules/wellSearch/sdk';
import { WellboreExternalIdMap } from 'modules/wellSearch/types';

import { EVENT_PER_PAGE } from './common';

export async function getNptEventsByWellboreIds(
  wellboreExternalIdMap: WellboreExternalIdMap,
  metric?: Metrics
) {
  let networkTimer: ITimer | undefined;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_EVENTS_NDS
    );
  }

  const wellboreIds = Object.values(wellboreExternalIdMap);
  let { items, nextCursor } = await getNPTItems(
    { wellboreIds },
    undefined,
    EVENT_PER_PAGE
  );

  while (nextCursor) {
    // eslint-disable-next-line no-await-in-loop
    const response = await getNPTItems(
      { wellboreIds },
      nextCursor,
      EVENT_PER_PAGE
    );
    nextCursor = response.nextCursor;
    items = [...items, ...response.items];
  }

  const groupedEvents = groupBy(
    items,
    (row) => wellboreExternalIdMap[row.parentExternalId]
  );

  wellboreIds.forEach((wellboreId) => {
    if (!groupedEvents[wellboreId]) {
      groupedEvents[wellboreId] = [];
    }
  });

  useStopTimeLogger(networkTimer, {
    noOfWellbores: wellboreIds.length,
    noOfNptEvents: items.length,
  });

  return Promise.resolve(groupedEvents);
}
