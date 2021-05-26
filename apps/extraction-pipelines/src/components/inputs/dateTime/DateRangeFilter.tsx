import React, { FunctionComponent, PropsWithChildren } from 'react';
import { DivFlex } from 'styles/flex/StyledFlex';
import styled from 'styled-components';
import { Colors, DateRange, Range } from '@cognite/cogs.js';
import { createDateWithTime } from 'components/inputs/dateTime/TimeSelectorUtils';

const Wrapper = styled(DivFlex)`
  .integrations-ui-style-scope {
    .tippy-box {
      background-color: transparent;
    }
  }
  .cogs-date-range--input {
    border: 1px solid ${Colors['greyscale-grey5'].hex()};
  }
`;
interface DateRangeFilterProps {
  dateRange: Range;
  dateRangeChanged: (range: Range) => void;
}

export const DateRangeFilter: FunctionComponent<DateRangeFilterProps> = ({
  dateRangeChanged,
  dateRange,
}: PropsWithChildren<DateRangeFilterProps>) => {
  const dateChanged = (newRange: Range) => {
    const end = createDateWithTime(newRange, dateRange, 'endDate');
    const start = createDateWithTime(newRange, dateRange, 'startDate');
    dateRangeChanged({ ...newRange, startDate: start, endDate: end });
  };
  return (
    <Wrapper align="flex-start">
      <DateRange range={dateRange} onChange={dateChanged} />
    </Wrapper>
  );
};
