import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { getMockResponse, mockError } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import NameView from './NameView';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderQueryCacheIntegration,
} from '../../utils/test/render';
import { SERVER_ERROR_TITLE } from '../buttons/ErrorMessageDialog';

describe('<NameView />', () => {
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
    render(<NameView />, { wrapper });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Edit - change - cancel', async () => {
    // click first edit btn
    const firstEditBtn = screen.getAllByText('Edit')[0];
    fireEvent.click(firstEditBtn);
    const inputEdit = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(inputEdit).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
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
      const originalValue = screen.getByText(integration.name);
      expect(originalValue).toBeInTheDocument();
    });
  });

  test('Edit - change - save', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [integration] } });
    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-name`);
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
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-name`);
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
    const oldValue = screen.getByText(integration.name);
    expect(oldValue).toBeInTheDocument();
  });
});
