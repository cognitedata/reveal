import { getMockResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import React from 'react';
import { ContactsSection } from 'components/integration/ContactsSection';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { TestIds } from 'components/integration/EditPartContacts';

describe('ContactSection', () => {
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

  test('Interact with component', async () => {
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    render(<ContactsSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mock.contacts[0].name);
    });
    expect(screen.getByText(TableHeadings.CONTACTS)).toBeInTheDocument();
    mock.contacts.forEach((c) => {
      expect(screen.getByText(c.name)).toBeInTheDocument();
      expect(screen.getByText(c.email)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(mock.contacts[0].name));
    await waitFor(() => {
      screen.getByDisplayValue(mock.contacts[0].name);
    });
    const newName = 'New name';
    fireEvent.change(screen.getByDisplayValue(mock.contacts[0].name), {
      target: { value: newName },
    });
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValue({
      data: { ...mock, contacts: [{ name: newName }] },
    });
    fireEvent.click(screen.getByTestId(`${TestIds.SAVE_BTN}0name`));
    await waitFor(() => {
      expect(
        screen.queryByTestId(`${TestIds.SAVE_BTN}0name`)
      ).not.toBeInTheDocument();
    });
  });
});
