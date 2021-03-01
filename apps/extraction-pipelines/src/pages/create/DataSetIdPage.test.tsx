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
import { DATA_SET_ID_PAGE_PATH } from '../../routing/CreateRouteConfig';
import { useDataSetsList } from '../../hooks/useDataSetsList';
import { datasetMockResponse } from '../../utils/mockResponse';

jest.mock('../../hooks/useDataSetsList', () => {
  return {
    useDataSetsList: jest.fn(),
  };
});
describe('RawTablePage', () => {
  let renderWrapper;
  beforeEach(() => {
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      DATA_SET_ID_PAGE_PATH
    );
    renderWrapper = wrapper;
  });
  test('Renders', () => {
    useDataSetsList.mockReturnValue({ data: { items: [] }, status: 'success' });
    render(<DataSetIdPage />, { wrapper: renderWrapper });
    const heading = screen.getAllByRole('heading');
    expect(heading[1].textContent).toEqual(INTEGRATION_DATA_SET_ID_HEADING);
    expect(
      screen.getByText(INTEGRATION_DATA_SET_ID_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByText(DATA_SET_ID_TIP)).toBeInTheDocument();
  });
  test('Renders - "backup"-input on error', () => {
    useDataSetsList.mockReturnValue({ data: { items: [] }, status: 'error' });
    render(<DataSetIdPage />, { wrapper: renderWrapper });
    const datasetInput = screen.getByLabelText(DATA_SET_ID_LABEL);
    expect(datasetInput).toBeInTheDocument();
    const inputValue = 'my data set';
    fireEvent.change(datasetInput, { target: { value: inputValue } });
    expect(screen.getByDisplayValue(inputValue)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    const { container } = render(<DataSetIdPage />, { wrapper: renderWrapper });
    const selectInput = await container.querySelector(
      '.cogs-select__input input'
    );
    const value = 'data';
    fireEvent.change(selectInput, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText(mock.items[0].name)).toBeInTheDocument();
    expect(screen.queryByText(mock.items[1].name)).not.toBeInTheDocument();
    expect(screen.getByText(mock.items[2].name)).toBeInTheDocument();
    expect(screen.queryByText(mock.items[3].name)).not.toBeInTheDocument();
  });
});
