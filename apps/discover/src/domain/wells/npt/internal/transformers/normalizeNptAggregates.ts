import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import { colorize } from 'utils/colorize';

import { NptAggregate } from '@cognite/sdk-wells';

import {
  DEFAULT_NPT_COLOR,
  PREDEFINED_NPT_COLORS,
  UNKNOWN_NPT_CODE,
  UNKNOWN_NPT_DETAIL_CODE,
} from '../constants';
import { NptAggregateRowInternal } from '../types';

export const normalizeNptAggregates = (
  nptAggregates: NptAggregate[]
): NptAggregateRowInternal[] => {
  const nptCodes = uniq(
    compact(
      nptAggregates.flatMap(({ items }) => items.map(({ nptCode }) => nptCode))
    )
  );
  const nptCodeColorMap = colorize(nptCodes, PREDEFINED_NPT_COLORS);

  return nptAggregates.flatMap(({ wellboreMatchingId, items }) =>
    items.map(({ nptCode, nptCodeDetail, duration, ...rest }) => ({
      ...rest,
      wellboreMatchingId,
      nptCode: nptCode || UNKNOWN_NPT_CODE,
      nptCodeDetail: nptCodeDetail || UNKNOWN_NPT_DETAIL_CODE,
      nptCodeColor: nptCode ? nptCodeColorMap[nptCode] : DEFAULT_NPT_COLOR,
      duration: duration && duration.value,
    }))
  );
};
