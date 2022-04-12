import sortedUniq from 'lodash/sortedUniq';

import {
  DistanceUnitEnum,
  Nds,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells-v3';

import { groupByWellbore } from './groupByWellbore';

export const getTrajectoryInterpolationRequests = (
  ndsEvents: Nds[]
): TrajectoryInterpolationRequest[] => {
  const groupedEvents = groupByWellbore(ndsEvents);

  return Object.keys(groupedEvents).map((wellboreMatchingId) => {
    const measuredDepths = sortedUniq(
      groupedEvents[wellboreMatchingId]
        .filter((event) => event.holeStart?.value || event.holeEnd?.value)
        .flatMap((event) => [
          event.holeStart?.value || 0,
          event.holeEnd?.value || 0,
        ])
    );

    // find first event that has holeStart unit
    const eventWithUnit = groupedEvents[wellboreMatchingId].find(
      (event) => event?.holeStart?.unit
    );

    const measuredDepthUnit = {
      // fallback to Meter as default unit
      unit: eventWithUnit?.holeStart?.unit || DistanceUnitEnum.Meter,
    };

    return {
      wellboreId: { matchingId: wellboreMatchingId },
      measuredDepths,
      measuredDepthUnit,
    };
  });
};
