import { Unit } from 'convert-units';
import { toFixedNumberFromNumber } from 'utils/number/toFixedNumberFromNumber';
import { changeUnitTo } from 'utils/units';

import { DistanceUnitEnum, Trajectory } from '@cognite/sdk-wells-v3';

export const getMd = (trajectory: Trajectory, changeToUnit?: Unit) => {
  let md = trajectory.maxMeasuredDepth;

  if (changeToUnit) {
    const changedMd = changeUnitTo(md, getMdUnit(), changeToUnit);

    if (changedMd) {
      md = changedMd;
    } else {
      console.log(`Error changing MD (${md}) to unit (${changeToUnit})`);
    }
  }

  return toFixedNumberFromNumber(md);
};

export const getMdUnit = (): DistanceUnitEnum => {
  return 'meter';
};
