import React from 'react';

import { DateRange, Range } from '@cognite/cogs.js';

export const DateRangeFilter: React.FC = () => {
  const [state, setState] = React.useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
  });
  return (
    <DateRange
      range={state}
      onChange={({ startDate, endDate }) => {
        setState({
          startDate,
          endDate,
        });
      }}
    />
  );
};
