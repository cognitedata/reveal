import { Unit } from 'convert-units';
import { toFixedNumberFromNumber } from 'utils/number/toFixedNumberFromNumber';
import { changeUnitTo } from 'utils/units';

import { DistanceUnitEnum, Trajectory } from '@cognite/sdk-wells-v3';

export const getTvd = (trajectory: Trajectory, changeToUnit?: Unit) => {
  let tvd = trajectory.maxTrueVerticalDepth;

  if (changeToUnit) {
    const changedTvd = changeUnitTo(tvd, getTvdUnit(), changeToUnit);

    if (changedTvd) {
      tvd = changedTvd;
    } else {
      console.log(`Error changing TVD (${tvd}) to unit (${changeToUnit})`);
    }
  }

  return toFixedNumberFromNumber(tvd, 2);
};

export const getTvdUnit = (): DistanceUnitEnum => {
  return 'meter';
};
