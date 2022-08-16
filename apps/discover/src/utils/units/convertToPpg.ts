import { log } from 'utils/log';

import {
  LBM_BBL_TO_PPG_CONVERSION_FACTOR,
  LBM_OVER_BBL,
  METER,
  METER_TO_FEET_FACTOR,
  PPG,
  PSI,
  PSI_TO_PPG_CONVERSION_FACTOR_FT,
  SG,
  SG_TO_PPG_CONVERSION_FACTOR_FT,
} from 'constants/units';

/**
 *
 * This is used to convert any value to ppg units
 */
export const convertToPpg = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string
) => {
  if (valueUnit === PPG) {
    return value;
  }

  let tvdInFeet = tvd || 1;
  if (tvdUnit === METER) {
    tvdInFeet *= METER_TO_FEET_FACTOR;
  }

  if (valueUnit === PSI) {
    return value / (tvdInFeet * PSI_TO_PPG_CONVERSION_FACTOR_FT);
  }

  if (valueUnit === LBM_OVER_BBL) {
    return value * LBM_BBL_TO_PPG_CONVERSION_FACTOR;
  }

  if (valueUnit === SG) {
    return value * SG_TO_PPG_CONVERSION_FACTOR_FT;
  }
  log(`Unit '${valueUnit}' is not recognized`);
  return value;
};
