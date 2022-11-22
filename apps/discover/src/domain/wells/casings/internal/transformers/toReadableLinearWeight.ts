import { LinearWeight } from 'utils/units/constants';

export const toReadableLinearWeight = (linearWeight: LinearWeight) => {
  const {
    value,
    unit: { weightUnit, depthUnit },
  } = linearWeight;

  return `${value}${weightUnit}/${depthUnit}`;
};
