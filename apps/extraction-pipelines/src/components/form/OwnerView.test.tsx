import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { getMockResponse, mockError } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import OwnerView from './OwnerView';
import { renderQueryCacheIntegration } from '../../utils/test/render';
import { SERVER_ERROR_TITLE } from '../buttons/ErrorMessageDialog';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import { EMAIL_NOTIFICATION_TOOLTIP } from '../../utils/constants';

describe('<OwnerView />', () => {
  const integration = getMockResponse()[0];
  let client: QueryClient;
  let wrapper;
  beforeEach(() => {
    client = new QueryClient();
    wrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Edit - change - cancel', async () => {
    render(<OwnerView />, { wrapper });

    // click first edit btn
    const firstEditBtn = screen.getAllByText('Edit')[0];
    fireEvent.click(firstEditBtn);

    // change notification checkbox
    const sendNotificationCheckbox = screen.getByLabelText(
      EMAIL_NOTIFICATION_TOOLTIP
    );
    expect(screen.queryByTestId('warning-icon-owner')).not.toBeInTheDocument();
    expect(sendNotificationCheckbox.checked).toEqual(false);
    fireEvent.click(sendNotificationCheckbox);
    expect(sendNotificationCheckbox.checked).toEqual(true);
    expect(screen.getByTestId('warning-icon-owner')).toBeInTheDocument();

    // change value in input
    const inputEdit = screen.getByDisplayValue(integration.owner.name); // assuming name is editable
    const newValue = 'New Name';
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
      const originalValue = screen.getByText(integration.owner.name);
      expect(originalValue).toBeInTheDocument();
      expect(sendNotificationCheckbox.checked).toEqual(false);
    });
  });

  test('Edit - change - validation - save', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [integration] } });
    render(<OwnerView />, { wrapper });

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.owner.name); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = '';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    expect(screen.getByDisplayValue(newValue)).toBeInTheDocument();
    expect(screen.getByTestId(`warning-icon-owner`)).toBeInTheDocument();

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(/is required/)).toBeInTheDocument();
    });

    const validValue = 'Test Name';
    fireEvent.change(nameInput, { target: { value: validValue } });
    fireEvent.blur(nameInput);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
    expect(screen.getByText(validValue)).toBeInTheDocument();
  });

  test('Edit - change - save - error', async () => {
    sdkv3.post.mockRejectedValue(mockError);
    render(<OwnerView />, { wrapper });

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.owner.email); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'test@test.no';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-owner`);
    expect(warning).toBeInTheDocument();

    // click save. new value saved. just display value
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText(SERVER_ERROR_TITLE)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      const noSaveBtn = screen.queryByText('Save');
      expect(noSaveBtn).not.toBeInTheDocument();
    });
    const oldValue = screen.getByText(integration.owner.email);
    expect(oldValue).toBeInTheDocument();
    expect(oldValue.getAttribute('href')).toEqual(
      `mailto:${integration.owner.email}`
    );
  });
});
