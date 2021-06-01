type DateRangeValueTypes = {
  lastHour: 'Last hour';
  lastDay: 'Last day';
  lastMonth: 'Last month';
};

export type DateRangeValueType =
  | DateRangeValueTypes['lastHour']
  | DateRangeValueTypes['lastDay']
  | DateRangeValueTypes['lastMonth'];

export const DATE_RANGE_VALUES: { [key: string]: DateRangeValueType } = {
  lastHour: 'Last hour',
  lastDay: 'Last day',
  lastMonth: 'Last month',
};

export const getTimestampParamForDateRange = (
  dateRangeValue: DateRangeValueType
): number => {
  const timestamp = new Date();
  if (dateRangeValue === DATE_RANGE_VALUES.lastHour) {
    timestamp.setHours(timestamp.getHours() - 1);
  } else if (dateRangeValue === DATE_RANGE_VALUES.lastDay) {
    timestamp.setDate(timestamp.getDate() - 1);
    timestamp.setHours(timestamp.getHours() + 1);
  } else {
    timestamp.setMonth(timestamp.getMonth() - 1);
  }
  return timestamp.getTime();
};
