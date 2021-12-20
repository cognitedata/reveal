import sortedUniq from 'lodash/sortedUniq';

import {
  DistanceUnitEnum,
  Nds,
  TrajectoryInterpolationRequest,
  TrueVerticalDepths,
} from '@cognite/sdk-wells-v3';

import { groupByWellbore } from './groupByWellbore';

export const getTrajectoryInterpolationRequests = (
  ndsEvents: Nds[]
): TrajectoryInterpolationRequest[] => {
  const groupedEvents = groupByWellbore(ndsEvents);

  return Object.keys(groupedEvents).map((wellboreMatchingId) => {
    const measuredDepths = sortedUniq(
      groupedEvents[wellboreMatchingId].flatMap((event) => [
        event.holeStart.value,
        event.holeEnd.value,
      ])
    );
    const measuredDepthUnit = {
      unit: groupedEvents[wellboreMatchingId][0].holeStart.unit,
    };

    return {
      wellboreId: { matchingId: wellboreMatchingId },
      measuredDepths,
      measuredDepthUnit,
    };
  });
};

export const getTVDForMD = (
  tvdsForWellbore: TrueVerticalDepths,
  md: number
) => {
  const measuredDepthIndex = tvdsForWellbore.measuredDepths.indexOf(md);
  return tvdsForWellbore.trueVerticalDepths[measuredDepthIndex];
};

export const getDummyTrueVerticalDepths = (
  ndsEvents: Nds[]
): TrueVerticalDepths[] => {
  const groupedEvents = groupByWellbore(ndsEvents);

  return Object.keys(groupedEvents).map((wellboreMatchingId) => ({
    trueVerticalDepths: [],
    measuredDepths: [],
    trueVerticalDepthUnit: {
      unit: DistanceUnitEnum.Meter,
    },
    sequenceSource: {
      sequenceExternalId: '',
      sourceName: '',
    },
    wellboreAssetExternalId:
      groupedEvents[wellboreMatchingId][0].wellboreAssetExternalId,
    wellboreMatchingId,
  }));
};
