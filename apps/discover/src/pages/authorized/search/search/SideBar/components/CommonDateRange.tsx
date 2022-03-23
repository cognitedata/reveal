import React from 'react';

import { endOf, currentDate, getDateOrDefaultText } from 'utils/date';
import { SHORT_DATE_FORMAT } from 'utils/date/constants';

import { DateRange, Range } from '@cognite/cogs.js';

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
      maxDate={minMaxRange?.endDate || endOf(currentDate(), 'day')}
      minDate={minMaxRange?.startDate}
      offsetWithEndOfDay
      onChange={onChange}
      type={type}
      calendarHasBorder={calendarHasBorder}
      startDatePlaceholder={getDateOrDefaultText(new Date())}
      endDatePlaceholder={getDateOrDefaultText(new Date())}
    />
  );
};
