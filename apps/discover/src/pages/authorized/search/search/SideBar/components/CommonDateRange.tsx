import React from 'react';

import { DateRange, Range } from '@cognite/cogs.js';

import { currentDate, SHORT_DATE_FORMAT } from '_helpers/date';

export const CommonDateRange: React.FC<{
  range: Range;
  minMaxRange?: Range;
  onChange: (dates: Range) => void;
  type?: string;
  calendarHasBorder?: boolean;
  prependComponent?: () => JSX.Element;
  appendComponent?: () => JSX.Element;
}> = (props) => {
  const {
    range,
    minMaxRange,
    type,
    calendarHasBorder,
    onChange,
    prependComponent,
    appendComponent,
  } = props;

  return (
    <DateRange
      range={range}
      format={SHORT_DATE_FORMAT}
      prependComponent={prependComponent}
      appendComponent={appendComponent}
      maxDate={minMaxRange?.endDate || currentDate()}
      minDate={minMaxRange?.startDate}
      onChange={onChange}
      type={type}
      calendarHasBorder={calendarHasBorder}
      startDatePlaceholder="From"
      endDatePlaceholder="To"
    />
  );
};
