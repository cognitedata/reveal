import moment from 'moment';

export const isDateDiffLessThanDays = (
  lastUpdatedTime: number,
  numberOfDays: number,
  unitOfTime: moment.unitOfTime.Diff
): boolean => {
  const t = moment().diff(lastUpdatedTime, unitOfTime);
  return t < numberOfDays;
};
