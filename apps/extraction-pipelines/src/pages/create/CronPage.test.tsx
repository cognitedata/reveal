import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import CronPage, {
  CRON_LABEL,
  CRON_TIP,
  INTEGRATION_CRON_HEADING,
} from './CronPage';
import { CRON_PAGE_PATH } from '../../routing/CreateRouteConfig';
import { NEXT } from '../../utils/constants';
import { CRON_INVALID } from '../../utils/validation/cronValidation';
import { parseCron } from '../../utils/cronUtils';

describe('CronPage', () => {
  beforeEach(() => {
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      CRON_PAGE_PATH
    );
    render(<CronPage />, { wrapper });
  });
  test('Renders', () => {
    const heading = screen.getAllByRole('heading');
    expect(heading[1].textContent).toEqual(INTEGRATION_CRON_HEADING);
    expect(screen.getByText(INTEGRATION_CRON_HEADING)).toBeInTheDocument();
    expect(screen.getByText(CRON_TIP)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const next = screen.getByText(NEXT);
    const dataSetId = screen.getByLabelText(CRON_LABEL);
    const invalid = '0 0 9';
    fireEvent.change(dataSetId, { target: { value: invalid } });
    fireEvent.click(next);
    expect(
      await screen.findByText(new RegExp(CRON_INVALID, 'i'))
    ).toBeInTheDocument();
    const value = '0 0 9 1/1 * ? *';
    fireEvent.change(dataSetId, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText(parseCron(value))).toBeInTheDocument();
  });
});
