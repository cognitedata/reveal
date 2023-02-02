import isNil from 'lodash/isNil';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

import { DrillingDays, WellboreInternal } from '../types';

type WellboreType = Pick<WellboreInternal, 'matchingId' | 'totalDrillingDays'>;

export const calculateDrillingDays = <T extends WellboreType>(
  wellbore: T,
  parentWellbore?: T
): DrillingDays | undefined => {
  if (isNil(wellbore.totalDrillingDays)) {
    return undefined;
  }

  const wellboreDrillingDays = toFixedNumberFromNumber(
    wellbore.totalDrillingDays - (parentWellbore?.totalDrillingDays || 0),
    Fixed.TwoDecimals
  );

  return {
    wellboreMatchingId: wellbore.matchingId,
    wellbore: wellboreDrillingDays,
    total: wellbore.totalDrillingDays,
  };
};
