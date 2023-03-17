import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import difference from 'lodash/difference';

import { TimePeriods } from './components/TimePeriods';

import { useTimerseriesQuery } from './hooks/useTimerseriesQuery';
import {
  DateRange,
  TimePeriod,
  TimeseriesChartProps,
  UpdateTimePeriodProps,
} from './types';
import {
  DEFAULT_DATAPOINTS_LIMIT,
  EMPTY_DATA,
  TIME_PERIOD_OPTIONS,
} from './constants';
import { TimePeriodSelect } from './components/TimePeriodSelect';
import { getChartByVariant } from './utils/getChartByVariant';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesId,
  variant = 'large',
  numberOfPoints = DEFAULT_DATAPOINTS_LIMIT,
  quickTimePeriodOptions = [],
  dateRange: dateRangeProp,
  backgroundColor,
  height,
  onChangeTimePeriod,
}) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>();
  const [dateRange, setDateRange] = useState<DateRange>();

  const { data, isLoading } = useTimerseriesQuery({
    timeseriesId,
    start: dateRange?.[0],
    end: dateRange?.[1],
    limit: numberOfPoints,
  });

  const timePeriodSelectOptions = useMemo(() => {
    return difference(TIME_PERIOD_OPTIONS, quickTimePeriodOptions);
  }, [quickTimePeriodOptions]);

  const updateDateRange = (props: UpdateTimePeriodProps) => {
    setSelectedTimePeriod(props.timePeriod);
    setDateRange(props.dateRange);

    onChangeTimePeriod?.(props);
  };

  useEffect(() => {
    if (dateRangeProp) {
      setSelectedTimePeriod(undefined);
      setDateRange(dateRangeProp);
    }
  }, [dateRangeProp]);

  const Chart = getChartByVariant(variant);

  return (
    <Chart
      data={data || EMPTY_DATA}
      isLoading={isLoading}
      style={{ backgroundColor, height }}
      renderFilters={() => [
        <TimePeriods
          options={quickTimePeriodOptions}
          value={selectedTimePeriod}
          onChange={updateDateRange}
        />,
        <TimePeriodSelect
          options={timePeriodSelectOptions}
          value={selectedTimePeriod}
          onChange={updateDateRange}
        />,
      ]}
    />
  );
};
