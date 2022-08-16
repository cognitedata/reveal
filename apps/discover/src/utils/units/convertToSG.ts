import { convertToPsi } from 'utils/units';

import {
  FEET,
  METER,
  METER_TO_FEET_FACTOR,
  PSI_TO_SG_CONVERSION_FACTOR_FT,
  SG,
} from 'constants/units';

/**
 *
 * This is used to convert any value to SG units
 */
export const convertToSG = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string
) => {
  if (valueUnit === SG) {
    return value;
  }
  let tvdInFeet = tvd || 1;
  if (tvdUnit === METER) {
    tvdInFeet *= METER_TO_FEET_FACTOR;
  }
  const psiValue = convertToPsi(value, valueUnit, tvdInFeet, FEET);
  return psiValue / tvdInFeet / PSI_TO_SG_CONVERSION_FACTOR_FT;
};
