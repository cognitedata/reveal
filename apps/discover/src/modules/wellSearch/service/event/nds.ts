import groupBy from 'lodash/groupBy';
import invert from 'lodash/invert';
import set from 'lodash/set';

import { ITimer, Metrics } from '@cognite/metrics';
import { CogniteEvent } from '@cognite/sdk';
import {
  NdsItems,
  TrajectoryInterpolationItems,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells-v3';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { LOG_EVENTS_NDS } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import { WellboreSourceExternalIdMap } from 'modules/wellSearch/types';

import { EVENT_LIMIT, EVENT_PER_PAGE, groupEventsByAssetId } from './common';

export function getNdsEventsByWellboreIds(
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  metric?: Metrics,
  enableWellSDKV3?: boolean
) {
  let networkTimer: ITimer | undefined;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_EVENTS_NDS
    );
  }

  const fetchNdsEvents = () =>
    enableWellSDKV3
      ? fetchNdsEventsUsingWellsSDK(wellboreIds, wellboreSourceExternalIdMap)
      : fetchNdsEventsCogniteSDK(wellboreIds, wellboreSourceExternalIdMap);

  return fetchNdsEvents().finally(() => {
    useStopTimeLogger(networkTimer, {
      noOfWellbores: wellboreIds.length,
    });
  });
}

export const fetchNdsEventsUsingWellsSDK = async (
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const ndsEventsRequestBody = {
    filter: {
      wellboreIds: wellboreIds.map(toIdentifier),
    },
    limit: EVENT_PER_PAGE,
  };

  const ndsEvents = await getWellSDKClient().nds.list(ndsEventsRequestBody);
  const ndsEventsAsCogniteEvents = await mapNdsItemsToCogniteEvents(
    ndsEvents,
    wellboreSourceExternalIdMap
  );

  return getGroupedNdsEvents(
    ndsEventsAsCogniteEvents,
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
  ndsItems: NdsItems,
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const trajectoryInterpolationRequests: TrajectoryInterpolationRequest[] =
    ndsItems.items.map((event) => ({
      wellboreId: { assetExternalId: event.wellboreAssetExternalId },
      measuredDepths: [event.holeStart.value, event.holeEnd.value],
      measuredDepthUnit: { unit: event.holeStart.unit },
    }));

  const trajectoryInterpolationItems =
    (await getWellSDKClient().trajectories.interpolate(
      trajectoryInterpolationRequests
    )) as TrajectoryInterpolationItems;

  const groupedTVD = groupBy(
    trajectoryInterpolationItems.items,
    'wellboreAssetExternalId'
  );

  return ndsItems.items.map((event) => {
    const tvd = groupedTVD[event.wellboreAssetExternalId][0];

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
        tvd_offset_hole_start: tvd.trueVerticalDepths[0],
        tvd_offset_hole_start_unit: tvd.trueVerticalDepthUnit.unit,
        tvd_offset_hole_end: tvd.trueVerticalDepths[1],
        tvd_offset_hole_end_unit: tvd.trueVerticalDepthUnit.unit,
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
