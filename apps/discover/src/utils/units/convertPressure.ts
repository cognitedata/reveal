import { log } from 'utils/log';
import { convertToSG, convertToPsi, convertToPpg } from 'utils/units';

import { PPG, PSI, SG } from 'constants/units';

export const convertPressure = (
  value: number,
  valueUnit: string,
  tvd?: number,
  tvdUnit?: string,
  convertToUnit?: string
) => {
  switch (convertToUnit) {
    case PPG:
      return convertToPpg(value, valueUnit, tvd, tvdUnit);
    case PSI:
      return convertToPsi(value, valueUnit, tvd, tvdUnit);
    case SG:
      return convertToSG(value, valueUnit, tvd, tvdUnit);
    default: {
      if (convertToUnit) {
        log(`Unit '${convertToUnit}' is not recognized`);
      }
      return value;
    }
  }
};
