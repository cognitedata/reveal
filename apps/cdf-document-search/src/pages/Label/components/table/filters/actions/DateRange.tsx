import React from 'react';

import { DateRange, Range } from '@cognite/cogs.js';

interface Props {}

export const DateRangeFilter: React.FC<Props> = () => {
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
