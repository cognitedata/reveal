import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithReactHookForm } from 'utils/test/render';
import { parseCron } from 'utils/cronUtils';
import CronInput from './CronInput';
import { CRON_LABEL, CRON_TIP } from "utils/constants"

describe('CronInput', () => {
  beforeEach(() => {
    renderWithReactHookForm(<CronInput />, { defaultValues: {} });
  });
  test('Renders', () => {
    expect(screen.getByTestId('cron-title')).toBeInTheDocument();
    expect(screen.getByTestId('cron-info')).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const dataSetId = screen.getByTestId('cron-title-input');

    const value = '0 0 9 1/1 * ? *';
    fireEvent.change(dataSetId, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText(parseCron(value))).toBeInTheDocument();
  });
});
