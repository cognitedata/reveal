import moment, { Moment } from 'moment';
import { RunApi } from 'model/Runs';

export const and = <T>(
  predicate1: (value: T) => boolean,
  predicate2: (value: T) => boolean
) => {
  return (value: T) => {
    return predicate1(value) && predicate2(value);
  };
};

export const filterByTimeBetween = (startTime: Moment, endTime: Moment) => {
  return ({ createdTime }: Pick<RunApi, 'createdTime'>) => {
    return moment(createdTime).isBetween(startTime, endTime);
  };
};

export const isWithinDaysInThePast = (days: number) =>
  filterByTimeBetween(moment().subtract(days, 'days'), moment());
