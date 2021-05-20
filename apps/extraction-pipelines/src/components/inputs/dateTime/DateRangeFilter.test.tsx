import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { DateRangeFilter } from 'components/inputs/dateTime/DateRangeFilter';
import moment from 'moment';
import { DATE_FORMAT } from 'components/TimeDisplay/TimeDisplay';

describe('DateRangeFilter', () => {
  test('interacts with component', () => {
    const start = moment().subtract(1, 'week');
    const end = moment();
    const dateRange = {
      startDate: start.toDate(),
      endDate: end.toDate(),
    };
    const dateRangeChanged = jest.fn();

    render(
      <DateRangeFilter
        dateRangeChanged={dateRangeChanged}
        dateRange={dateRange}
      />
    );
    expect(
      screen.getByDisplayValue(start.format(DATE_FORMAT))
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(end.format(DATE_FORMAT))
    ).toBeInTheDocument();
    const newStart = '2021-03-03';
    fireEvent.change(screen.getByDisplayValue(start.format(DATE_FORMAT)), {
      target: { value: newStart },
    });
    const newEnd = '2021-05-01';
    fireEvent.change(screen.getByDisplayValue(end.format(DATE_FORMAT)), {
      target: { value: newEnd },
    });
    fireEvent.blur(screen.getByDisplayValue(newStart));
    expect(dateRangeChanged).toHaveBeenCalledTimes(1);
    fireEvent.focus(screen.getByDisplayValue(newStart));
  });
});
