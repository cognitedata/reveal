import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { DateRangeFilter } from 'components/inputs/dateTime/DateRangeFilter';
import moment from 'moment';
import { DATE_FORMAT } from 'components/TimeDisplay/TimeDisplay';
import { renderWithRunFilterContext } from 'utils/test/render';

describe('DateRangeFilter', () => {
  const start = moment().subtract(1, 'week');
  const end = moment();
  const dateRange = {
    startDate: start.toDate(),
    endDate: end.toDate(),
  };

  test('Default render', () => {
    const { container } = render(<DateRangeFilter />);
    const calendar = container.getElementsByClassName(
      'cogs-date-range--input'
    )[0];
    expect(calendar).toBeInTheDocument();
  });

  test('Displays stored date range and interacts with component', () => {
    renderWithRunFilterContext(<DateRangeFilter />, {
      providerProps: { dateRange },
    });
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
    fireEvent.focus(screen.getByDisplayValue(newStart));
  });
});
