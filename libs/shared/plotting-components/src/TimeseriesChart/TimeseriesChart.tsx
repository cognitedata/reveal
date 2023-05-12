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
import { TIME_PERIOD_OPTIONS } from './constants';
import { TimePeriodSelect } from './components/TimePeriodSelect';
import { OpenInChartsButton } from './components/OpenInChartsButton';
import { DateRangePicker } from './components/DateRangePicker';
import { getChartByVariant } from './utils/getChartByVariant';
import { formatDateRangeForAxis } from './utils/formatDateRangeForAxis';
import { useTimeseriesChartData } from './domain/internal/hooks/useTimeseriesChartData';
import { PlotRange } from '../LineChart';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesId,
  variant = 'large',
  numberOfPoints,
  quickTimePeriodOptions = [],
  dateRange: dateRangeProp,
  height,
  dataFetchOptions,
  autoRange,
  onChangeTimePeriod,
  onChangeDateRange,
}) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    dateRangeProp
  );

  const { data, metadata, isLoading } = useTimeseriesChartData({
    query: {
      timeseriesId,
      dateRange,
      numberOfPoints,
    },
    dataFetchOptions,
  });

  const timePeriodSelectOptions = useMemo(() => {
    return difference(TIME_PERIOD_OPTIONS, quickTimePeriodOptions);
  }, [quickTimePeriodOptions]);

  const chartRange = useMemo(() => {
    if (autoRange || !dateRange) {
      return undefined;
    }
    return {
      x: formatDateRangeForAxis(dateRange),
    };
  }, [autoRange, dateRange]);

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

  const handleRangeChange = (range: PlotRange) => {
    const [from, to] = range.x;
    setSelectedTimePeriod(undefined);
    setDateRange([new Date(from), new Date(to)]);
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
      metadata={metadata}
      dataRevision={timeseriesId}
      isLoading={isLoading}
      range={chartRange}
      style={{ height }}
      onRangeChange={handleRangeChange}
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
