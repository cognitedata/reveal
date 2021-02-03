import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import DataSetIdPage, {
  DATA_SET_ID_LABEL,
  DATA_SET_ID_TIP,
  INTEGRATION_DATA_SET_ID_HEADING,
} from './DataSetIdPage';
import { DATA_SET_ID_PAGE_PATH } from '../../routing/RoutingConfig';

describe('RawTablePage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      DATA_SET_ID_PAGE_PATH
    );
    render(<DataSetIdPage />, { wrapper });
  });
  test('Renders', () => {
    const heading = screen.getAllByRole('heading');
    expect(heading[1].textContent).toEqual(INTEGRATION_DATA_SET_ID_HEADING);
    expect(
      screen.getByText(INTEGRATION_DATA_SET_ID_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByText(DATA_SET_ID_TIP)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const dataSetId = screen.getByLabelText(DATA_SET_ID_LABEL);
    const value = '123123123';
    fireEvent.change(dataSetId, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
  });
});
