import * as React from 'react';
import { useMemo, useState } from 'react';

import difference from 'lodash/difference';

import { LineChart } from '../LineChart';
import { TimePeriods } from './components/TimePeriods';

import { useTimerseriesQuery } from './hooks/useTimerseriesQuery';
import {
  TimePeriod,
  TimeseriesChartProps,
  UpdateDateRangeProps,
} from './types';
import { formatTooltipContent } from './utils/formatTooltipContent';
import { CONFIG, EMPTY_DATA, LAYOUT, TIME_PERIOD_OPTIONS } from './constants';
import { formatHoverLineInfo } from './utils/formatHoverLineInfo';
import { TimePeriodSelect } from './components/TimePeriodSelect';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesId,
  quickTimePeriodOptions = [],
  dateRange,
  onChangeDateRange,
  height,
}) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>();
  const [[start, end], setDateRange] = useState(
    dateRange || [undefined, undefined]
  );

  const { data } = useTimerseriesQuery({
    timeseriesId,
    start,
    end,
  });

  const timePeriodSelectOptions = useMemo(() => {
    return difference(TIME_PERIOD_OPTIONS, quickTimePeriodOptions);
  }, [quickTimePeriodOptions]);

  const updateDateRange = ({
    timePeriod: newTimePeriod,
    dateRange: newDateRange,
  }: UpdateDateRangeProps) => {
    setSelectedTimePeriod(newTimePeriod);
    setDateRange(newDateRange);
    onChangeDateRange?.(newDateRange);
  };

  return (
    <LineChart
      data={data || EMPTY_DATA}
      layout={LAYOUT}
      config={CONFIG}
      style={{ height }}
      formatTooltipContent={formatTooltipContent}
      formatHoverLineInfo={formatHoverLineInfo}
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
