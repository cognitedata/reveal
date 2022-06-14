import { CasingSchematicInternal } from 'domain/wells/casings/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/transformers/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';
import { Fixed } from 'utils/number';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

import { CasingAssemblyView } from '../types';

export const adaptCasingAssembliesDataToView = (
  casingSchematic: CasingSchematicInternal,
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
): CasingAssemblyView[] => {
  if (!trueVerticalDepths) {
    return casingSchematic.casingAssemblies;
  }

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  return casingSchematic.casingAssemblies.map((casingAssembly) => {
    const { measuredDepthBase, measuredDepthTop } = casingAssembly;

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

    const tvdData: Partial<CasingAssemblyView> = {};

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

    return {
      ...casingAssembly,
      ...tvdData,
    };
  });
};
