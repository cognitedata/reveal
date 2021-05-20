import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { EditNotification } from 'components/integration/edit/EditNotification';
import {
  HOURS_LABEL,
  NOTIFICATION_CONFIG_HEADER,
} from 'components/inputs/NotificationConfig';
import { SAVE } from 'utils/constants';
import { hoursToMinutes } from 'utils/integrationUtils';

describe('EditNotifications', () => {
  const mock = getMockResponse()[0];
  const mockDataSet = mockDataSetResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test('Interacts with component', async () => {
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
    render(<EditNotification />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(NOTIFICATION_CONFIG_HEADER);
    });
    expect(screen.getByLabelText(NOTIFICATION_CONFIG_HEADER).checked).toEqual(
      false
    );
    fireEvent.click(screen.getByLabelText(NOTIFICATION_CONFIG_HEADER));
    const addHours = screen.getByText(/add hours/i);
    fireEvent.click(addHours);
    const value = 5;
    fireEvent.change(screen.getByLabelText(HOURS_LABEL), {
      target: { value },
    });

    const postedIntegration = {
      ...mock,
      skipNotificationsInMinutes: hoursToMinutes(value),
    };
    sdkv3.post.mockResolvedValue({ data: { items: [postedIntegration] } });
    sdkv3.get.mockResolvedValueOnce({ data: postedIntegration });
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(value);
    });
    fireEvent.click(screen.getByText(value));
    const secondValue = 2;
    fireEvent.change(screen.getByDisplayValue(value), {
      target: { value: secondValue },
    });
    const secondValueIntegration = {
      ...mock,
      skipNotificationsInMinutes: hoursToMinutes(secondValue),
    };
    sdkv3.get.mockResolvedValueOnce({ data: secondValueIntegration });
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(secondValue);
    });
    fireEvent.click(screen.getByText(secondValue));
    expect(screen.getByDisplayValue(secondValue)).toBeInTheDocument();
  });
});
