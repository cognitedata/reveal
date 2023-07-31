import { getInterpolateTvd } from 'domain/wells/trajectory/service/network/getInterpolateTvd';

import { ConvertedDistance } from 'utils/units/constants';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import {
  TrajectoryInterpolationRequest,
  TrueVerticalDepths,
} from '@cognite/sdk-wells';

import { WellboreInternal } from '../../internal/types';

type WellboreType = Pick<
  WellboreInternal,
  'matchingId' | 'sources' | 'kickoffMeasuredDepth'
>;

export const getWellboresKickoffTVD = <T extends WellboreType>(
  wellbores: T[]
): Promise<TrueVerticalDepths[]> => {
  const kickoffDepthsMD = wellbores.reduce(
    (result, { matchingId, kickoffMeasuredDepth }) => {
      return {
        ...result,
        [matchingId]: kickoffMeasuredDepth,
      };
    },
    {} as Record<string, ConvertedDistance | undefined>
  );

  const responseItems = wellbores.map(({ matchingId, sources }) => {
    return {
      wellboreMatchingId: matchingId,
      wellboreAssetExternalId: sources[0].assetExternalId,
    };
  });

  const interpolateRequests: TrajectoryInterpolationRequest[] = Object.entries(
    kickoffDepthsMD
  ).reduce((result, [matchingId, kickoffMeasuredDepth]) => {
    if (!kickoffMeasuredDepth) {
      return result;
    }

    const { value, unit } = kickoffMeasuredDepth;

    return [
      ...result,
      {
        wellboreId: { matchingId },
        measuredDepths: [value],
        measuredDepthUnit: toDistanceUnit(unit),
      },
    ];
  }, [] as TrajectoryInterpolationRequest[]);

  return getInterpolateTvd(responseItems, interpolateRequests);
};
