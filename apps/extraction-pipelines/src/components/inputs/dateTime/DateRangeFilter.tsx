import React, { FunctionComponent } from 'react';

import styled from 'styled-components';

import { Colors, DateRange, Range } from '@cognite/cogs.js';

import {
  updateDateRangeAction,
  useRunFilterContext,
} from '../../../hooks/runs/RunsFilterContext';
import { DivFlex } from '../../styled';

import { createDateWithTime } from './TimeSelectorUtils';

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
