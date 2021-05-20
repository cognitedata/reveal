import React from 'react';
import {
  RANGE_END_LABEL,
  RANGE_START_LABEL,
  TimeSelector,
} from 'components/inputs/dateTime/TimeSelector';
import { render } from 'utils/test';
import moment from 'moment';
import { fireEvent, screen } from '@testing-library/react';

describe('TimeSelector', () => {
  const dates = {
    startDate: moment().subtract(1, 'week').toDate(),
    endDate: moment().toDate(),
  };
  const dateRangeChanged = jest.fn();
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Interact with input', () => {
    render(
      <TimeSelector dateRange={dates} dateRangeChanged={dateRangeChanged} />
    );
    expect(screen.getByLabelText(RANGE_START_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(RANGE_END_LABEL)).toBeInTheDocument();
    const newEndTime = '10:23';
    fireEvent.change(screen.getByLabelText(RANGE_END_LABEL), {
      target: { value: newEndTime },
    });
    expect(dateRangeChanged).toHaveBeenCalledTimes(1);
  });
});
