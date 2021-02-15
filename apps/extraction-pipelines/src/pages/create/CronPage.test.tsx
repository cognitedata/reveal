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
import { CRON_EXPRESSION_PAGE_PATH } from '../../routing/RoutingConfig';

describe('CronPage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      CRON_EXPRESSION_PAGE_PATH
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
    const dataSetId = screen.getByLabelText(CRON_LABEL);
    const value = '0 0 9 1/1 * ? *';
    fireEvent.change(dataSetId, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
  });
});
