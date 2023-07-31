import { getTvdForMd } from 'domain/wells/trajectory/internal/selectors/getTvdForMd';
import { TvdDataWithMdIndex } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';

import { HoleSectionGroup } from '@cognite/sdk-wells';

import {
  HoleSectionGroupWithTvd,
  HoleSectionInternalWithTvd,
} from '../../internal/types';

export const mergeHoleSectionsTvdData = (
  holeSectionGroup: HoleSectionGroup,
  trueVerticalDepths: TvdDataWithMdIndex
): HoleSectionGroupWithTvd => {
  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  const sections = holeSectionGroup.sections.map((section) => {
    const { topMeasuredDepth, baseMeasuredDepth } = section;

    const tvdData: Partial<HoleSectionInternalWithTvd> = {};

    if (!isUndefined(topMeasuredDepth)) {
      const tvdTop = getTvdForMd(topMeasuredDepth, trueVerticalDepths);
      tvdData.topTrueVerticalDepth = tvdTop;
    }

    if (!isUndefined(baseMeasuredDepth)) {
      const tvdBase = getTvdForMd(baseMeasuredDepth, trueVerticalDepths);
      tvdData.baseTrueVerticalDepth = tvdBase;
    }

    return {
      ...section,
      ...tvdData,
    };
  });

  return {
    ...holeSectionGroup,
    trueVerticalDepthUnit: unit,
    sections,
  };
};
