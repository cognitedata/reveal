import { Unit } from 'convert-units';
import { toFixedNumberFromNumber } from 'utils/number/toFixedNumberFromNumber';
import { changeUnitTo } from 'utils/units';

import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

import { Wellbore } from 'modules/wellSearch/types';

const KB_REFERENCE_IDENTIFIER = 'KB';

export const getRkbLevel = (
  wellbore: Wellbore,
  changeToUnit?: Unit
): Wellbore['datum'] => {
  const { datum } = wellbore;

  if (!datum || datum.reference !== KB_REFERENCE_IDENTIFIER) {
    return undefined;
  }

  let rkbValue: number | undefined = datum.value;

  if (changeToUnit && wellbore.datum?.value) {
    rkbValue = changeUnitTo(
      wellbore.datum?.value,
      // remove cast when @sdk-wells-v2 is removed
      wellbore.datum?.unit as DistanceUnitEnum,
      changeToUnit
    );
  }

  if (!rkbValue || !wellbore.datum?.unit) {
    return undefined;
  }

  return {
    ...wellbore.datum,
    value: toFixedNumberFromNumber(rkbValue),
  };
};
