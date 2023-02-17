import { TrajectoryDataRow } from '@cognite/sdk-wells';

import { KickoffDepth, KickoffPoint } from '../types';
import { getTrajectoryScalers } from '../utils/getTrajectoryScalers';

type Props =
  | {
      kickoffDepth: KickoffDepth;
      trajectoryRows?: never;
      scaleMDtoED: (value: number) => number;
      scaleTVDtoED: (value: number) => number;
    }
  | {
      kickoffDepth: KickoffDepth;
      trajectoryRows: TrajectoryDataRow[];
      scaleMDtoED?: never;
      scaleTVDtoED?: never;
    };

export const getKickoffPoint = ({
  kickoffDepth,
  trajectoryRows,
  scaleMDtoED: scaleMDtoEDOriginal,
  scaleTVDtoED: scaleTVDtoEDOriginal,
}: Props): KickoffPoint | undefined => {
  const getScalers = () => {
    if (scaleMDtoEDOriginal && scaleTVDtoEDOriginal) {
      return {
        scaleMDtoED: scaleMDtoEDOriginal,
        scaleTVDtoED: scaleTVDtoEDOriginal,
      };
    }
    return getTrajectoryScalers(trajectoryRows);
  };

  const { scaleMDtoED, scaleTVDtoED } = getScalers();

  return {
    ...kickoffDepth,
    equivalentDepartureMD: scaleMDtoED(kickoffDepth.measuredDepth),
    equivalentDepartureTVD: scaleTVDtoED(kickoffDepth.trueVerticalDepth),
  };
};
