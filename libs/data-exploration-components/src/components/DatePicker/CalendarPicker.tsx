/* eslint-disable no-nested-ternary */
import React from 'react';

import { DateRange, Range } from '@cognite/cogs.js';

type CalendarPickerProps = {
  dates: [Date, Date];
  onDatesChanged?: (start: Date, end: Date) => void;
};

export const CalendarPicker = ({
  dates,
  onDatesChanged = () => {},
}: CalendarPickerProps) => {
  const onChange = (date: Range) => {
    onDatesChanged(date.startDate!, date.endDate!);
  };

  return (
    <DateRange
      type="standard"
      calendarHasBorder={false}
      title="Select a range"
      showClose
      range={{ startDate: dates[0], endDate: dates[1] }}
      onChange={onChange}
    />
  );
};
