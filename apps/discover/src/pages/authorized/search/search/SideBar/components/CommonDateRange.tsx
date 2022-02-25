import React from 'react';

import { endOf, currentDate } from 'utils/date';
import { SHORT_DATE_FORMAT } from 'utils/date/constants';

import { DateRange, Range } from '@cognite/cogs.js';

import {
  DATE_RANGE_FILTER_FROM_PLACEHOLDER,
  DATE_RANGE_FILTER_TO_PLACEHOLDER,
} from '../constants';

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
      startDatePlaceholder={DATE_RANGE_FILTER_FROM_PLACEHOLDER}
      endDatePlaceholder={DATE_RANGE_FILTER_TO_PLACEHOLDER}
    />
  );
};
