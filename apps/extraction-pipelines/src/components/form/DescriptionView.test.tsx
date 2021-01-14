import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DetailFieldNames, Integration } from 'model/Integration';
import { getMockResponse, mockError } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import { renderQueryCacheIntegration } from '../../utils/test/render';
import DescriptionView from './DescriptionView';
import { SERVER_ERROR_TITLE } from '../buttons/ErrorMessageDialog';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';

describe('<DescriptionView />', () => {
  const integration = getMockResponse()[0];
  let client: QueryClient;
  beforeEach(() => {
    client = new QueryClient();
    const wrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<DescriptionView />, { wrapper });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Edit - change - cancel', async () => {
    // click first edit btn
    const firstEditBtn = screen.getAllByText('Edit')[0];
    fireEvent.click(firstEditBtn);
    const inputEdit = screen.getByDisplayValue(integration.description);
    expect(inputEdit).toBeInTheDocument();

    // change value in input
    const newValue = 'New description for this integration';
    fireEvent.change(inputEdit, { target: { value: newValue } });

    // input should still be displayed
    fireEvent.blur(inputEdit);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const saveBtn = screen.getByText('Save');
    const cancelBtn = screen.getByText('Cancel');
    expect(saveBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // click cancel. resets to original value. no input field
    fireEvent.click(cancelBtn);
    await waitFor(() => {
      const noCancelBtn = screen.queryByText('Cancel');
      expect(noCancelBtn).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const originalValue = screen.getByText(integration.description);
      expect(originalValue).toBeInTheDocument();
    });
  });

  test('Edit - change - save', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [integration] } });

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.description); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'New description for this integration';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-description`);
    expect(warning).toBeInTheDocument();

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      const noSaveBtn = screen.queryByText('Save');
      expect(noSaveBtn).not.toBeInTheDocument();
    });
    const newValueForRow = screen.getByText(newValue);
    expect(newValueForRow).toBeInTheDocument();
  });

  test('Edit - change - save - error', async () => {
    sdkv3.post.mockRejectedValue(mockError);

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.description); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-description`);
    expect(warning).toBeInTheDocument();

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(SERVER_ERROR_TITLE)).toBeInTheDocument();
    });
    const OKBtn = screen.getByText('OK');
    fireEvent.click(OKBtn);

    await waitFor(() => {
      const noSaveBtn = screen.queryByText('Save');
      expect(noSaveBtn).not.toBeInTheDocument();
    });
    const oldValue = screen.getByText(integration.description);
    expect(oldValue).toBeInTheDocument();
  });
});

test('Should render and interact with description field', async () => {
  sdkv3.post.mockResolvedValue({ data: { items: [getMockResponse()[0]] } });
  const integration = getMockResponse()[0];
  const wrapper = renderQueryCacheIntegration(
    new QueryClient(),
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    integration
  );
  render(<DescriptionView />, { wrapper });
  expect(screen.getByText(DetailFieldNames.DESCRIPTION)).toBeInTheDocument();
  expect(screen.queryByText(integration.description)).toBeInTheDocument();
  const editBtn = screen.getByText('Edit');
  fireEvent.click(editBtn);
  const textArea = screen.getByDisplayValue(integration.description);
  expect(textArea).toBeInTheDocument();
  const newDescription = 'This is new';
  fireEvent.change(textArea, { target: { value: newDescription } });
  fireEvent.blur(textArea);
  expect(screen.getByTestId('warning-icon-description')).toBeInTheDocument();
  const saveBtn = screen.getByText('Save');
  expect(saveBtn).toBeInTheDocument();
  fireEvent.click(saveBtn);
  expect(await screen.findByText(newDescription)).toBeInTheDocument();
});

test('Should render when description is undefined', () => {
  const integration = {
    ...getMockResponse()[0],
    description: undefined,
  } as Integration;

  const wrapper = renderQueryCacheIntegration(
    new QueryClient(),
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    integration
  );
  render(<DescriptionView />, { wrapper });
  expect(screen.getByText(DetailFieldNames.DESCRIPTION)).toBeInTheDocument();
  expect(screen.queryByTestId('integration-description')?.textContent).toEqual(
    ''
  );
});

test('Should render when there is no description field', () => {
  const integration = { name: 'This is the name' } as Integration;

  const wrapper = renderQueryCacheIntegration(
    new QueryClient(),
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    integration
  );
  render(<DescriptionView />, { wrapper });
  expect(screen.getByText(DetailFieldNames.DESCRIPTION)).toBeInTheDocument();
  expect(screen.queryByTestId('integration-description')?.textContent).toEqual(
    ''
  );
});
