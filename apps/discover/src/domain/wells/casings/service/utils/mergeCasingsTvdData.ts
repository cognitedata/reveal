import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TvdDataWithMdIndex } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';

import { CasingSchematic } from '@cognite/sdk-wells/dist/src';

import {
  CasingAssemblyWithTvd,
  CasingSchematicWithTvd,
} from '../../internal/types';

export const mergeCasingsTvdData = (
  casingSchematic: CasingSchematic,
  trueVerticalDepths: TvdDataWithMdIndex
): CasingSchematicWithTvd => {
  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  const casingAssemblies = casingSchematic.casingAssemblies.map(
    (casingAssembly) => {
      const { originalMeasuredDepthTop, originalMeasuredDepthBase, cementing } =
        casingAssembly;

      const tvdData: Partial<CasingAssemblyWithTvd> = {};

      const tvdTop = getTvdForMd(originalMeasuredDepthTop, trueVerticalDepths);
      const tvdBase = getTvdForMd(
        originalMeasuredDepthBase,
        trueVerticalDepths
      );

      if (!isUndefined(tvdTop)) {
        tvdData.trueVerticalDepthTop = { value: tvdTop, unit };
      }

      if (!isUndefined(tvdBase)) {
        tvdData.trueVerticalDepthBase = { value: tvdBase, unit };
      }

      if (cementing) {
        const {
          topMeasuredDepth: cementingTop,
          baseMeasuredDepth: cementingBase,
        } = cementing;

        const cementingTopTvd =
          cementingTop && getTvdForMd(cementingTop, trueVerticalDepths);
        const cementingBaseTvd =
          cementingBase && getTvdForMd(cementingBase, trueVerticalDepths);

        tvdData.cementing = {
          ...cementing,
          topTrueVerticalDepth: isUndefined(cementingTopTvd)
            ? undefined
            : { value: cementingTopTvd, unit },
          baseTrueVerticalDepth: isUndefined(cementingBaseTvd)
            ? undefined
            : { value: cementingBaseTvd, unit },
        };
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
