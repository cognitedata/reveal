import { GeneralInfoSection } from 'components/integration/GeneralInfoSection';
import { getMockResponse } from 'utils/mockResponse';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { parseCron } from 'utils/cronUtils';
import { ContactBtnTestIds } from 'components/form/ContactsView';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';

describe('GeneralInfo', () => {
  const mock = getMockResponse()[0];
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
  test('Interact with form', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValueOnce({ data: mock });

    render(<GeneralInfoSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mock.name);
    });
    const name = screen.getByText(mock.name);
    expect(name).toBeInTheDocument();
    const externalId = screen.getByText(mock.externalId);
    expect(externalId).toBeInTheDocument();
    expect(screen.getByText(mock.id)).toBeInTheDocument();
    const description = screen.getByText(mock.description);
    expect(description).toBeInTheDocument();
    const schedule = screen.getByText(parseCron(mock.schedule));
    expect(schedule).toBeInTheDocument();
    // name
    fireEvent.click(name);
    const newName = 'new name';
    fireEvent.change(screen.getByDisplayValue(mock.name), {
      target: { value: newName },
    });
    sdkv3.get.mockResolvedValueOnce({ data: { ...mock, name: newName } });
    fireEvent.click(screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}name`));
    await waitFor(() => {
      screen.getByText(newName);
    });
    fireEvent.click(screen.getByText(newName));
    expect(screen.getByDisplayValue(newName)).toBeInTheDocument();

    // externalId
    fireEvent.click(externalId);
    const newExternalId = 'new_id_1';
    fireEvent.change(screen.getByDisplayValue(mock.externalId), {
      target: { value: newExternalId },
    });
    sdkv3.get.mockResolvedValueOnce({
      data: { ...mock, externalId: newExternalId },
    });
    fireEvent.click(
      screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}externalId`)
    );
    await waitFor(() => {
      screen.getByText(newExternalId);
    });
    fireEvent.click(screen.getByText(newExternalId));
    expect(screen.getByDisplayValue(newExternalId)).toBeInTheDocument();

    // schedule
    fireEvent.click(schedule);
    fireEvent.keyDown(schedule, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(schedule, { key: 'Enter', code: 'Enter' });
    const newSchedule = SupportedScheduleStrings.SCHEDULED;
    await waitFor(() => {
      screen.getByText(newSchedule);
    });
    fireEvent.click(screen.getByText(newSchedule));

    // description
    fireEvent.click(description);
    const newDescription = 'Describe the integration';
    fireEvent.change(screen.getByDisplayValue(mock.description), {
      target: { value: newDescription },
    });
    sdkv3.get.mockResolvedValueOnce({
      data: { ...mock, description: newDescription },
    });
    fireEvent.click(
      screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}description`)
    );
    await waitFor(() => {
      screen.getByText(newDescription);
    });
    fireEvent.click(screen.getByText(newDescription));
    expect(screen.getByDisplayValue(newDescription)).toBeInTheDocument();
  });
});
