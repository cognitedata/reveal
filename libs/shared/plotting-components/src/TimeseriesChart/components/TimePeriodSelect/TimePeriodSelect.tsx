import * as React from 'react';
import { useMemo } from 'react';

import { OptionType, Select } from '@cognite/cogs.js';

import isEmpty from 'lodash/isEmpty';

import { DateRange, TimePeriod, UpdateDateRangeProps } from '../../types';
import { getDateRangeForTimePeriod } from '../../utils/getDateRangeForTimePeriod';

export interface TimePeriodSelectProps {
  options: TimePeriod[];
  value?: TimePeriod;
  onChange: (props: UpdateDateRangeProps) => void;
}

export const TimePeriodSelect: React.FC<TimePeriodSelectProps> = ({
  options,
  value: selectedTimePeriod,
  onChange,
}) => {
  const adaptedOptions = useMemo(() => {
    return options.map((timePeriod) => ({
      label: timePeriod,
      value: getDateRangeForTimePeriod(timePeriod),
    }));
  }, [options]);

  const handleChange = ({ label, value }: OptionType<DateRange>) => {
    onChange({
      timePeriod: label as TimePeriod,
      dateRange: value as DateRange,
    });
  };

  if (isEmpty(options)) {
    return null;
  }

  return (
    <Select
      title="Other:"
      width={160}
      options={adaptedOptions}
      value={selectedTimePeriod && { label: selectedTimePeriod }}
      onChange={handleChange}
    />
  );
};
