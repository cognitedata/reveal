import { useState } from 'react';

import { DateRange } from '@cognite/cogs.js';

type Range = {
  startDate: Date;
  endDate: Date;
};

type DateRangePromptProps = {
  initialRange: Range;
  onComplete: (dateRange: Range) => void;
};

/**
 * This is a thin wrapper around the cogs DateRange component that allows us to only propagate
 * changes when the apply button has been pressed, rather than at each date change.
 * @param initialRange
 * @constructor
 */
const DateRangePrompt: React.FC<DateRangePromptProps> = ({
  initialRange,
  onComplete,
}) => {
  const [dateRange, setDateRange] = useState<Range>(initialRange);
  return (
    <DateRange
      range={dateRange}
      onChange={(nextDateRange) => {
        setDateRange((prevDateRange) => ({
          ...prevDateRange,
          startDate: nextDateRange.startDate || prevDateRange.startDate,
          endDate: nextDateRange.endDate || prevDateRange.endDate,
        }));
      }}
      // This does nothing - just enables a button inside of the cogs Date Range component
      onApplyClick={() => onComplete(dateRange)}
    />
  );
};

export default DateRangePrompt;
