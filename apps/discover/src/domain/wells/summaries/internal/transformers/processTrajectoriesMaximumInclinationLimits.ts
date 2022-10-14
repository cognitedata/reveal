import { AngleRange } from '@cognite/sdk-wells';

const POSSIBLE_MIN_INCLINATION = 0;
const POSSIBLE_MAX_INCLINATION = 120;

export const processTrajectoriesMaximumInclinationLimits = ({
  min = POSSIBLE_MIN_INCLINATION,
  max = POSSIBLE_MAX_INCLINATION,
}: AngleRange) => {
  const minRounded = Math.floor(min * 100 + Number.EPSILON) / 100;
  const maxRounded = Math.ceil(max * 100 + Number.EPSILON) / 100;

  return [minRounded, maxRounded];
};
