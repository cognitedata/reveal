import * as React from 'react';

import { DateRange } from '../../types';

import { RangePicker } from './DatePicker';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (dateRange: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <RangePicker
      buttonProps={{
        type: 'secondary',
      }}
      initialRange={value}
      onRangeChanged={onChange}
    />
  );
};
