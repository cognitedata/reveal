import moment from 'moment';
import { Range } from '@cognite/cogs.js';
import { QuickFilterType } from 'components/table/QuickDateTimeFilters';

export const isDateDiffLessThanDays = (
  lastUpdatedTime: number,
  numberOfDays: number,
  unitOfTime: moment.unitOfTime.Diff
): boolean => {
  const t = moment().diff(lastUpdatedTime, unitOfTime);
  return t < numberOfDays;
};

export const findSelectedRangeOption = (
  options: ReadonlyArray<QuickFilterType>,
  range: Range
) => {
  const selectedOption = options.find(({ startDate, endDate }) => {
    return (
      moment(range.startDate).isSame(moment(startDate), 'minute') &&
      moment(range.endDate).isSame(moment(endDate), 'minute')
    );
  });
  return selectedOption ? selectedOption.label : undefined;
};
