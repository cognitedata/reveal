import React from 'react';
import {

  TimeSelector,
} from 'components/inputs/dateTime/TimeSelector';
import { render } from 'utils/test';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRunFilterContext } from 'utils/test/render';

describe('TimeSelector', () => {
  test('Render default', () => {
    render(<TimeSelector />);
    const start = screen.getByTestId('date-range-start-input');
    expect(start).toBeInTheDocument();
    const end = screen.getByTestId('date-range-end-input');
    expect(end).toBeInTheDocument();
    expect(start.textContent).toEqual('');
    expect(end.textContent).toEqual('');
  });

  test('Shows value from provider', () => {
    const startHours = 10;
    const startMin = 22;
    const endMin = 3;
    const endHours = 22;
    const dateRange = {
      startDate: new Date(2021, 5, 17, startHours, startMin),
      endDate: new Date(2021, 5, 17, endHours, endMin),
    };
    renderWithRunFilterContext(<TimeSelector />, {
      providerProps: { dateRange },
    });
    const startInput = screen.getByTestId('date-range-start-input');
    expect(startInput).toBeInTheDocument();
    const endInput = screen.getByTestId('date-range-end-input');
    expect(endInput).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${startHours}:${startMin}`)
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(`${endHours}:0${endMin}`)
    ).toBeInTheDocument();
  });

  test('Interact with input', () => {
    renderWithRunFilterContext(<TimeSelector />, {});
    expect(screen.getByTestId('date-range-start-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-end-input')).toBeInTheDocument();
    const newEndTime = '10:23';
    fireEvent.change(screen.getByTestId('date-range-end-input'), {
      target: { value: newEndTime },
    });
    expect(screen.getByDisplayValue(newEndTime)).toBeInTheDocument();
  });
});
