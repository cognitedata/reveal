import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithReactHookForm } from '@extraction-pipelines/utils/test/render';
import { datasetMockResponse } from '@extraction-pipelines/utils/mockResponse';
import { TableHeadings } from '@extraction-pipelines/components/table/ExtpipeTableCol';
import DataSetIdInput from '@extraction-pipelines/pages/create/DataSetIdInput';

jest.mock('@extraction-pipelines/hooks/useDataSetsList', () => {
  return {
    useDataSetsList: jest.fn(),
  };
});
describe('RawTablePage', () => {
  test('Renders', () => {
    renderWithReactHookForm(
      <DataSetIdInput
        data={[]}
        status="success"
        renderLabel={(labelText, inputId) => (
          <label htmlFor={inputId}>{labelText}</label>
        )}
      />,
      { defaultValues: {} }
    );
    expect(screen.getByText(TableHeadings.DATA_SET)).toBeInTheDocument();
    expect(screen.getByTestId('data-set-id-hint')).toBeInTheDocument();
  });
  test('Renders - "backup"-input on error', () => {
    renderWithReactHookForm(
      <DataSetIdInput
        data={[]}
        status="error"
        renderLabel={(labelText, inputId) => (
          <label htmlFor={inputId}>{labelText}</label>
        )}
      />,
      { defaultValues: {} }
    );
    const datasetInput = screen.getByLabelText(TableHeadings.DATA_SET);
    expect(datasetInput).toBeInTheDocument();
    const inputValue = 'my data set';
    fireEvent.change(datasetInput, { target: { value: inputValue } });
    expect(screen.getByDisplayValue(inputValue)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const mock = datasetMockResponse();
    const { container } = renderWithReactHookForm(
      <DataSetIdInput data={mock.items} status="success" />,
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
  test.skip(`Show no data set exist when search does no find dataset`, async () => {
    const mock = datasetMockResponse();
    const { container } = renderWithReactHookForm(
      <DataSetIdInput data={mock.items} status="success" />,
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
