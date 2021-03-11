import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithReactHookForm } from 'utils/test/render';
import DataSetIdInput, {
  DATA_SET_ID_LABEL,
  DATA_SET_ID_TIP,
} from 'pages/create/DataSetIdInput';
import { datasetMockResponse } from 'utils/mockResponse';

jest.mock('hooks/useDataSetsList', () => {
  return {
    useDataSetsList: jest.fn(),
  };
});
describe('RawTablePage', () => {
  test('Renders', () => {
    renderWithReactHookForm(
      <DataSetIdInput data={{ items: [] }} status="success" />,
      { defaultValues: {} }
    );
    expect(screen.getByText(DATA_SET_ID_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DATA_SET_ID_TIP)).toBeInTheDocument();
  });
  test('Renders - "backup"-input on error', () => {
    renderWithReactHookForm(
      <DataSetIdInput data={{ items: [] }} status="error" />,
      { defaultValues: {} }
    );
    const datasetInput = screen.getByLabelText(DATA_SET_ID_LABEL);
    expect(datasetInput).toBeInTheDocument();
    const inputValue = 'my data set';
    fireEvent.change(datasetInput, { target: { value: inputValue } });
    expect(screen.getByDisplayValue(inputValue)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const mock = datasetMockResponse();
    const { container } = renderWithReactHookForm(
      <DataSetIdInput data={mock} status="success" />,
      {
        defaultValues: {},
      }
    );
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
  test(`Show no data set exist when search does no find dataset`, async () => {
    const mock = datasetMockResponse();
    const { container } = renderWithReactHookForm(
      <DataSetIdInput data={mock} status="success" />,
      {
        defaultValues: {},
      }
    );
    const selectInput = await container.querySelector(
      '.cogs-select__input input'
    );
    const value = 'something not existing';
    fireEvent.change(selectInput, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
  });
});
