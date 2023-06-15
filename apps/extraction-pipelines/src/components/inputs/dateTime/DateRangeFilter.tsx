import React, { FunctionComponent } from 'react';

import styled from 'styled-components';

import { createDateWithTime } from '@extraction-pipelines/components/inputs/dateTime/TimeSelectorUtils';
import { DivFlex } from '@extraction-pipelines/components/styled';
import {
  updateDateRangeAction,
  useRunFilterContext,
} from '@extraction-pipelines/hooks/runs/RunsFilterContext';

import { Colors, DateRange, Range } from '@cognite/cogs.js';

const Wrapper = styled(DivFlex)`
  .extpipes-ui-style-scope {
    .tippy-box {
      background-color: transparent;
    }
  }
  .cogs-date-range--input {
    border: 1px solid ${Colors['decorative--grayscale--500']};
  }
`;
export const DateRangeFilter: FunctionComponent = () => {
  const {
    state: { dateRange },
    dispatch,
  } = useRunFilterContext();
  const dateChanged = (newRange: Range) => {
    const end = createDateWithTime(newRange, dateRange, 'endDate');
    const start = createDateWithTime(newRange, dateRange, 'startDate');
    dispatch(
      updateDateRangeAction({ ...newRange, startDate: start, endDate: end })
    );
  };
  return (
    <Wrapper align="flex-start">
      <DateRange range={dateRange} onChange={dateChanged} />
    </Wrapper>
  );
};
