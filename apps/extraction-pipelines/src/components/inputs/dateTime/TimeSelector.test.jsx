import React from 'react';
import {

  TimeSelector,
} from 'components/inputs/dateTime/TimeSelector';
import { render } from 'utils/test';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRunFilterContext } from 'utils/test/render';
import {
  RANGE_END_LABEL,
  RANGE_START_LABEL,
} from "utils/constants"

describe('TimeSelector', () => {
  test('Render default', () => {
    render(<TimeSelector />);
    const start = screen.getByLabelText(RANGE_START_LABEL);
    expect(start).toBeInTheDocument();
    const end = screen.getByLabelText(RANGE_END_LABEL);
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
    const startInput = screen.getByLabelText(RANGE_START_LABEL);
    expect(startInput).toBeInTheDocument();
    const endInput = screen.getByLabelText(RANGE_END_LABEL);
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
    expect(screen.getByLabelText(RANGE_START_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(RANGE_END_LABEL)).toBeInTheDocument();
    const newEndTime = '10:23';
    fireEvent.change(screen.getByLabelText(RANGE_END_LABEL), {
      target: { value: newEndTime },
    });
    expect(screen.getByDisplayValue(newEndTime)).toBeInTheDocument();
  });
});
