import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
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
import { DetailFieldNames } from 'model/Integration';
import { ADD_OWNER, EMAIL_LABEL, NAME_LABEL, SAVE } from 'utils/constants';

describe('ContactSection', () => {
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

  test('Interact with component', async () => {
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
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

  test('Interact with owner section', async () => {
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);

    render(<ContactsSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DetailFieldNames.OWNER);
    });
    expect(screen.getByText(ADD_OWNER)).toBeInTheDocument();
    fireEvent.click(screen.getByText(ADD_OWNER));
    await waitFor(() => {
      screen.getByDisplayValue(DetailFieldNames.OWNER);
    });
    const newOwner = 'New owner';
    fireEvent.change(screen.getByLabelText(NAME_LABEL), {
      target: { value: newOwner },
    });
    const ownerEmail = 'owner@email.com';
    fireEvent.change(screen.getByLabelText(EMAIL_LABEL), {
      target: { value: ownerEmail },
    });
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(newOwner);
      screen.getByText(ownerEmail);
    });
    expect(screen.queryByLabelText(SAVE)).not.toBeInTheDocument();
  });

  test('Dont render owner when there is one, and not add owner', async () => {
    const owner = { name: 'Im Owner', email: 'owner@test.no', role: 'Owner' };
    sdkv3.get.mockResolvedValueOnce({
      data: {
        ...mock,
        contacts: [owner],
      },
    });
    render(<ContactsSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DetailFieldNames.OWNER);
    });
    expect(screen.queryByText(ADD_OWNER)).not.toBeInTheDocument();
    expect(screen.getByText(owner.name)).toBeInTheDocument();
    expect(screen.getByText(owner.email)).toBeInTheDocument();
    expect(screen.getAllByText(owner.role).length).toEqual(2); // heading + role
  });
});
