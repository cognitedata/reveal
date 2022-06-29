import { CasingAssemblyInternal } from 'domain/wells/casings/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory0/internal/transformers/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory0/internal/types';

import isUndefined from 'lodash/isUndefined';
import { Fixed } from 'utils/number';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

import { CasingAssemblyView } from '../types';

export const getCasingAssemblyTvdData = (
  casingAssembly: CasingAssemblyInternal,
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
) => {
  const tvdData: Partial<CasingAssemblyView> = {};

  if (!trueVerticalDepths) {
    return tvdData;
  }

  const { measuredDepthBase, measuredDepthTop } = casingAssembly;
  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  const trueVerticalDepthBase = getTvdForMd(
    measuredDepthBase,
    trueVerticalDepths,
    Fixed.ThreeDecimals
  );
  const trueVerticalDepthTop = getTvdForMd(
    measuredDepthTop,
    trueVerticalDepths,
    Fixed.ThreeDecimals
  );

  if (!isUndefined(trueVerticalDepthBase)) {
    tvdData.trueVerticalDepthBase = adaptToConvertedDistance(
      trueVerticalDepthBase,
      unit
    );
  }

  if (!isUndefined(trueVerticalDepthTop)) {
    tvdData.trueVerticalDepthTop = adaptToConvertedDistance(
      trueVerticalDepthTop,
      unit
    );
  }

  return tvdData;
};
