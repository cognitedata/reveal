import { ColorMap } from 'utils/colorize';
import { convertDistance } from 'utils/units/convertDistance';

import { Npt } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import {
  DEFAULT_NPT_COLOR,
  UNKNOWN_NPT_CODE,
  UNKNOWN_NPT_DETAIL_CODE,
} from '../constants';
import { NptInternal } from '../types';

export const normalizeNpt = (
  rawNpt: Npt,
  userPreferredUnit: UserPreferredUnit,
  nptCodeColorMap: ColorMap
): NptInternal => {
  const { measuredDepth, nptCode, nptCodeDetail } = rawNpt;

  return {
    ...rawNpt,
    nptCode: nptCode || UNKNOWN_NPT_CODE,
    nptCodeDetail: nptCodeDetail || UNKNOWN_NPT_DETAIL_CODE,
    nptCodeColor: nptCode ? nptCodeColorMap[nptCode] : DEFAULT_NPT_COLOR,
    measuredDepth: measuredDepth
      ? convertDistance(measuredDepth, userPreferredUnit)
      : undefined,
  };
};
