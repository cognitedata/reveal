import { Well } from 'domain/wells/well/internal/types';

import { Unit } from 'convert-units';
import { toFixedNumberFromNumber } from 'utils/number/toFixedNumberFromNumber';
import { changeUnitTo } from 'utils/units';

import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

export const getWaterDepth = (
  well: Well,
  changeToUnit?: Unit
): Well['waterDepth'] => {
  let waterDepthValue = well.waterDepth?.value;

  if (changeToUnit && well.waterDepth?.value) {
    waterDepthValue = changeUnitTo(
      well.waterDepth?.value,
      // remove cast when @sdk-wells-v2 is removed
      well.waterDepth?.unit as DistanceUnitEnum,
      changeToUnit
    );
  }

  if (!waterDepthValue || !well.waterDepth?.unit) {
    return undefined;
  }

  return {
    ...well.waterDepth,
    value: toFixedNumberFromNumber(waterDepthValue),
  };
};
