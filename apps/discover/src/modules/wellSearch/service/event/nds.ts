import groupBy from 'lodash/groupBy';
import invert from 'lodash/invert';
import set from 'lodash/set';

import { CogniteEvent } from '@cognite/sdk';
import {
  Nds,
  NdsItems,
  TrajectoryInterpolationItems,
} from '@cognite/sdk-wells-v3';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { showErrorMessage } from 'components/toast';
import { MetricLogger } from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import { WellboreSourceExternalIdMap } from 'modules/wellSearch/types';
import {
  getDummyTrueVerticalDepths,
  getTrajectoryInterpolationRequests,
  getTVDForMD,
} from 'modules/wellSearch/utils/nds';

import { EVENT_LIMIT, EVENT_PER_PAGE, groupEventsByAssetId } from './common';

export function getNdsEventsByWellboreIds(
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  metricLogger: MetricLogger,
  enableWellSDKV3?: boolean
) {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;
  startNetworkTimer();

  const fetchNdsEvents = () =>
    enableWellSDKV3
      ? fetchNdsEventsUsingWellsSDK(wellboreIds, wellboreSourceExternalIdMap)
      : fetchNdsEventsCogniteSDK(wellboreIds, wellboreSourceExternalIdMap);

  return fetchNdsEvents().finally(() => {
    stopNetworkTimer({
      noOfWellbores: wellboreIds.length,
    });
  });
}

export const fetchNdsEventsUsingWellsSDK = async (
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const ndsEventsRequestBody = {
    filter: { wellboreIds: wellboreIds.map(toIdentifier) },
    limit: EVENT_PER_PAGE,
  };

  const ndsEvents = await Promise.resolve(
    getWellSDKClient()
      .nds.list(ndsEventsRequestBody)
      .then((ndsItems: NdsItems) =>
        mapNdsItemsToCogniteEvents(ndsItems.items, wellboreSourceExternalIdMap)
      )
  );

  return getGroupedNdsEvents(
    ndsEvents,
    wellboreIds,
    wellboreSourceExternalIdMap
  );
};

export const fetchNdsEventsCogniteSDK = async (
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const wellboresSourceExternalIdReverseMap = invert(
    wellboreSourceExternalIdMap
  );

  const ndsEventsRequestBody = {
    filter: {
      assetExternalIds: wellboreIds.map(
        (id) => wellboresSourceExternalIdReverseMap[id]
      ),
      source: 'NDS',
      metadata: {
        type: 'Risk',
      },
    },
    limit: EVENT_PER_PAGE,
  };

  const ndsEvents = await getCogniteSDKClient()
    .events.list(ndsEventsRequestBody)
    .autoPagingToArray({ limit: EVENT_LIMIT });

  return getGroupedNdsEvents(
    ndsEvents,
    wellboreIds,
    wellboreSourceExternalIdMap
  );
};

export const mapNdsItemsToCogniteEvents = async (
  ndsEvents: Nds[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const tvds = await getWellSDKClient()
    .trajectories.interpolate({
      items: getTrajectoryInterpolationRequests(ndsEvents),
      ignoreUnknownMeasuredDepths: true,
    })
    .then((interpolationItems: TrajectoryInterpolationItems) => {
      return groupBy(interpolationItems.items, 'wellboreMatchingId');
    })
    .catch(() => {
      showErrorMessage(
        'Something went wrong in getting True Vertical Depth values.'
      );

      return groupBy(
        getDummyTrueVerticalDepths(ndsEvents),
        'wellboreMatchingId'
      );
    });

  return ndsEvents.map((event) => {
    const tvdsForWellbore = tvds[event.wellboreMatchingId][0];
    const tvdUnit = tvdsForWellbore.trueVerticalDepthUnit.unit;

    return {
      id: wellboreSourceExternalIdMap[event.source.eventExternalId],
      externalId: event.source.eventExternalId,
      type: event.subtype || '',
      subtype: event.riskType || '',
      description: event.description,
      source: event.source.sourceName,
      metadata: {
        parentExternalId: event.wellboreAssetExternalId,
        diameter_hole: event.holeDiameter?.value,
        diameter_hole_unit: event.holeDiameter?.unit,
        md_hole_start: event.holeStart.value,
        md_hole_start_unit: event.holeStart.unit,
        md_hole_end: event.holeEnd.value,
        md_hole_end_unit: event.holeEnd.unit,
        risk_sub_category: event.subtype || '',
        severity: String(event.severity),
        probability: String(event.probability),
        tvd_offset_hole_start: getTVDForMD(
          tvdsForWellbore,
          event.holeStart.value
        ),
        tvd_offset_hole_start_unit: tvdUnit,
        tvd_offset_hole_end: getTVDForMD(tvdsForWellbore, event.holeEnd.value),
        tvd_offset_hole_end_unit: tvdUnit,
      },
      assetIds: [event.wellboreAssetExternalId],
    } as unknown as CogniteEvent;
  });
};

export const getGroupedNdsEvents = (
  response: CogniteEvent[],
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const events: CogniteEvent[] = response
    .filter((event) => (event.assetIds || []).length)
    .map((event) => ({
      ...event,
      assetIds: [
        wellboreSourceExternalIdMap[event.metadata?.parentExternalId || ''],
      ],
    }));

  const groupedEvents = groupEventsByAssetId(events);

  wellboreIds.forEach((wellboreId) => {
    if (!groupedEvents[wellboreId]) {
      set(groupedEvents, wellboreId, []);
    }
  });

  return groupedEvents;
};
