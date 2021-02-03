import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import RawTablePage, {
  RAW_TABLE_TIP,
  RawTableOptions,
  INTEGRATION_RAW_TABLE_HEADING,
} from './RawTablePage';
import { RAW_TABLE_PAGE_PATH } from '../../routing/RoutingConfig';

describe('RawTablePage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      RAW_TABLE_PAGE_PATH
    );
    render(<RawTablePage />, { wrapper });
  });
  test('Renders', () => {
    expect(screen.getByText(INTEGRATION_RAW_TABLE_HEADING)).toBeInTheDocument();
    expect(screen.getByText(RAW_TABLE_TIP)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const yesOption = screen.getByLabelText(RawTableOptions.YES);
    expect(yesOption.getAttribute('aria-checked')).toEqual('false');
    const noOption = screen.getByLabelText(RawTableOptions.NO);
    expect(noOption.getAttribute('aria-checked')).toEqual('false');
    fireEvent.click(noOption);
    await waitFor(() => {
      expect(noOption.getAttribute('aria-checked')).toEqual('true');
    });
  });
});
