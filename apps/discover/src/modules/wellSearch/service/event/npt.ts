import groupBy from 'lodash/groupBy';
import set from 'lodash/set';

// import { MetricLogger } from 'hooks/useTimeLog';
import { getNPTItems } from 'modules/wellSearch/sdk';
import { WellboreExternalIdMap } from 'modules/wellSearch/types';

import { EVENT_PER_PAGE } from './common';

export const getNptEventsByWellboreIds = async (
  wellboreExternalIdMap: WellboreExternalIdMap
  // metricLogger: MetricLogger
) => {
  // const [startNetworkTimer, stopNetworkTimer] = metricLogger;
  // startNetworkTimer();

  const wellboreIds = Object.values(wellboreExternalIdMap);
  let { items, nextCursor } = await getNPTItems({
    filter: { wellboreIds },
    limit: EVENT_PER_PAGE,
  });

  while (nextCursor) {
    // eslint-disable-next-line no-await-in-loop
    const response = await getNPTItems({
      filter: { wellboreIds },
      cursor: nextCursor,
      limit: EVENT_PER_PAGE,
    });
    nextCursor = response.nextCursor;
    items = [...items, ...response.items];
  }

  const groupedEvents = groupBy(
    items,
    (row) => wellboreExternalIdMap[row.parentExternalId]
  );

  wellboreIds.forEach((wellboreId) => {
    if (!groupedEvents[wellboreId]) {
      set(groupedEvents, wellboreId, []);
    }
  });

  // stopNetworkTimer({
  //   noOfWellbores: wellboreIds.length,
  //   noOfNptEvents: items.length,
  // });

  return Promise.resolve(groupedEvents);
};
