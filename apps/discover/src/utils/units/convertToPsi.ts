import { convertToPpg } from 'utils/units';

import {
  FEET,
  METER,
  METER_TO_FEET_FACTOR,
  PSI,
  PSI_TO_PPG_CONVERSION_FACTOR_FT,
} from 'constants/units';

/**
 *
 * This is used to convert any value to psi units
 */
export const convertToPsi = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string
) => {
  if (valueUnit === PSI) {
    return value;
  }
  let tvdInFeet = tvd || 1;
  if (tvdUnit === METER) {
    tvdInFeet *= METER_TO_FEET_FACTOR;
  }
  const ppgValue = convertToPpg(value, valueUnit, tvdInFeet, FEET);
  return ppgValue * tvdInFeet * PSI_TO_PPG_CONVERSION_FACTOR_FT;
};
