import React, { useCallback } from 'react';

import { endOf, currentDate, SHORT_DATE_FORMAT } from 'utils/date';

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

  // onChange interceptor for changing endDate to end of day ( to be handled from Cogs )
  const handleChange = useCallback(
    (updatedRange: Range) => {
      const endDate = updatedRange?.endDate;
      onChange({
        ...updatedRange,
        endDate: endDate ? endOf(endDate, 'day') : endDate,
      });
    },
    [onChange]
  );

  return (
    <DateRange
      range={range}
      format={SHORT_DATE_FORMAT}
      prependComponent={prependComponent}
      appendComponent={appendComponent}
      maxDate={minMaxRange?.endDate || endOf(currentDate(), 'day')}
      minDate={minMaxRange?.startDate}
      onChange={handleChange}
      type={type}
      calendarHasBorder={calendarHasBorder}
      startDatePlaceholder={DATE_RANGE_FILTER_FROM_PLACEHOLDER}
      endDatePlaceholder={DATE_RANGE_FILTER_TO_PLACEHOLDER}
    />
  );
};
