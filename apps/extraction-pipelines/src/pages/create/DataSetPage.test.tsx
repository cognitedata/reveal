import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import DataSetPage, {
  CREATE_DATA_SET_LABEL,
  DATA_SET_TIP,
  DataSetOptions,
  INTEGRATION_DATA_SET_HEADING,
} from './DataSetPage';
import { DATA_SET_PAGE_PATH } from '../../routing/RoutingConfig';

describe('DatasetPage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      DATA_SET_PAGE_PATH
    );
    render(<DataSetPage />, { wrapper });
  });
  test('Renders', () => {
    expect(screen.getByText(INTEGRATION_DATA_SET_HEADING)).toBeInTheDocument();
    expect(screen.getByText(DATA_SET_TIP)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const yesOption = screen.getByLabelText(DataSetOptions.YES);
    expect(yesOption.getAttribute('aria-checked')).toEqual('false');
    const noOption = screen.getByLabelText(DataSetOptions.NO);
    expect(noOption.getAttribute('aria-checked')).toEqual('false');
    const createOption = screen.getByLabelText(CREATE_DATA_SET_LABEL);
    expect(createOption.getAttribute('aria-checked')).toEqual('false');
    fireEvent.click(noOption);
    await waitFor(() => {
      expect(noOption.getAttribute('aria-checked')).toEqual('true');
    });
  });
});
