import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

import {
  CasingAssemblyInternalWithTvd,
  CasingSchematicInternal,
  CasingSchematicInternalWithTvd,
} from '../types';

export const mergeCasingsTvdData = (
  casingSchematic: CasingSchematicInternal,
  trueVerticalDepths: TrueVerticalDepthsDataLayer
): CasingSchematicInternalWithTvd => {
  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  const casingAssemblies = casingSchematic.casingAssemblies.map(
    (casingAssembly) => {
      const { measuredDepthTop, measuredDepthBase } = casingAssembly;

      const tvdData: Partial<CasingAssemblyInternalWithTvd> = {};

      const tvdTop = getTvdForMd(measuredDepthTop, trueVerticalDepths);
      const tvdBase = getTvdForMd(measuredDepthBase, trueVerticalDepths);

      if (!isUndefined(tvdTop)) {
        tvdData.trueVerticalDepthTop = adaptToConvertedDistance(tvdTop, unit);
      }

      if (!isUndefined(tvdBase)) {
        tvdData.trueVerticalDepthBase = adaptToConvertedDistance(tvdBase, unit);
      }

      return {
        ...casingAssembly,
        ...tvdData,
      };
    }
  );

  return {
    ...casingSchematic,
    casingAssemblies,
  };
};
