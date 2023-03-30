import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import difference from 'lodash/difference';

import { TimePeriods } from './components/TimePeriods';

import {
  DateRange,
  TimePeriod,
  TimeseriesChartProps,
  UpdateTimePeriodProps,
} from './types';
import { DEFAULT_DATAPOINTS_LIMIT, TIME_PERIOD_OPTIONS } from './constants';
import { TimePeriodSelect } from './components/TimePeriodSelect';
import { OpenInChartsButton } from './components/OpenInChartsButton';
import { DateRangePicker } from './components/DateRangePicker';
import { getChartByVariant } from './utils/getChartByVariant';
import { useTimeseriesChartData } from './domain/internal/hooks/useTimeseriesChartData';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesId,
  variant = 'large',
  numberOfPoints = DEFAULT_DATAPOINTS_LIMIT,
  isString = false,
  quickTimePeriodOptions = [],
  dateRange: dateRangeProp,
  height,
  onChangeTimePeriod,
  onChangeDateRange,
}) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>();
  const [dateRange, setDateRange] = useState<DateRange>();

  const { data, isLoading } = useTimeseriesChartData({
    timeseriesId,
    dateRange,
    numberOfPoints,
    isString,
  });

  const timePeriodSelectOptions = useMemo(() => {
    return difference(TIME_PERIOD_OPTIONS, quickTimePeriodOptions);
  }, [quickTimePeriodOptions]);

  const handleChangeTimePeriod = (props: UpdateTimePeriodProps) => {
    setSelectedTimePeriod(props.timePeriod);
    setDateRange(props.dateRange);
    onChangeTimePeriod?.(props);
  };

  const handleChangeDateRange = (newDateRange: DateRange) => {
    setSelectedTimePeriod(undefined);
    setDateRange(newDateRange);
    onChangeDateRange?.(newDateRange);
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
      data={data}
      isLoading={isLoading}
      style={{ height }}
      renderFilters={() => [
        <TimePeriods
          options={quickTimePeriodOptions}
          value={selectedTimePeriod}
          onChange={handleChangeTimePeriod}
        />,
        <TimePeriodSelect
          options={timePeriodSelectOptions}
          value={selectedTimePeriod}
          onChange={handleChangeTimePeriod}
        />,
        <DateRangePicker value={dateRange} onChange={handleChangeDateRange} />,
      ]}
      renderActions={() => [
        <OpenInChartsButton
          timeseriesId={timeseriesId}
          dateRange={dateRange}
        />,
      ]}
    />
  );
};
