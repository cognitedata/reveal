import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { renderWithRunFilterContext } from 'utils/test/render';
import {
  DAYS_30,
  DAYS_7,
  HOURS_1,
  HOURS_24,
  QuickDateTimeFilters,
} from 'components/table/QuickDateTimeFilters';
import moment from 'moment';

describe('QuickDateTimeFilters', () => {
  test('Render default', async () => {
    render(<QuickDateTimeFilters />);
    const h1 = screen.getByLabelText(HOURS_1);
    expect(h1).toBeInTheDocument();
    const h24 = screen.getByLabelText(HOURS_24);
    expect(h24).toBeInTheDocument();
    const d7 = screen.getByLabelText(DAYS_7);
    expect(d7).toBeInTheDocument();
    const d30 = screen.getByLabelText(DAYS_30);
    expect(d30).toBeInTheDocument();
  });

  test('Shows value from provider', () => {
    const dateRange = {
      startDate: moment().subtract(1, 'day').toDate(),
      endDate: moment().toDate(),
    };
    renderWithRunFilterContext(<QuickDateTimeFilters />, {
      providerProps: { dateRange },
    });
    const selected = screen.getByLabelText(HOURS_1);
    expect(selected).toBeInTheDocument();
    expect(selected.checked).toBeDefined();
  });

  test('Interact with input', () => {
    const dateRange = {
      startDate: moment().subtract(30, 'days').toDate(),
      endDate: moment().toDate(),
    };
    renderWithRunFilterContext(<QuickDateTimeFilters />, {
      providerProps: { dateRange },
    });
    const selected = screen.getByLabelText(DAYS_30);
    expect(selected).toBeInTheDocument();
    expect(selected.checked).toBeDefined();
    fireEvent.click(screen.getByLabelText(HOURS_1));
    expect(screen.getByLabelText(HOURS_1).checked).toBeDefined();
  });
});
