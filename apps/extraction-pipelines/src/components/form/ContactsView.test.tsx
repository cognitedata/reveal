import React from 'react';
import { QueryCache } from 'react-query';
import { screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { act } from 'react-test-renderer';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { getMockResponse } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import {
  addBtnTestId,
  addNewContact,
  clickById,
  existsContactAsync,
  removeContact,
} from '../../utils/test/utilsFn';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderQueryCacheIntegration,
} from '../../utils/test/render';
import ContactsView, {
  ContactBtnTestIds,
  ContactsErrorMsg,
} from './ContactsView';

describe('<ContactsView />', () => {
  let queryCache: QueryCache;
  const integration = getMockResponse()[0];
  beforeEach(() => {
    queryCache = new QueryCache();
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    act(() => {
      render(<ContactsView />, { wrapper });
    });
  });
  afterEach(() => {
    cleanup();
  });

  test('Invalid email validation and text change warning', async () => {
    const row = 0;
    const editBtn = screen.getByTestId(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    fireEvent.click(editBtn);
    const editContact = integration.authors[row];
    act(() => {
      const contactEmailInput = screen.getByDisplayValue(editContact.email);
      fireEvent.change(contactEmailInput, { target: { value: 'sdfsdf' } });
      fireEvent.blur(contactEmailInput);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(`warning-icon-author-${row}-email`)
      ).toBeInTheDocument();
    });

    const saveBtn = screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}${row}`);
    act(() => {
      fireEvent.click(saveBtn);
    });
    await waitFor(() => {
      expect(
        screen.getByText(ContactsErrorMsg.EMAIL_INVALID)
      ).toBeInTheDocument();
    });
  });

  test('add 3, remove first of new', async () => {
    const newRow = integration.authors.length + 1;
    addNewContact(newRow, 'Test Name', 'test@email.com');
    const contact2 = {
      name: 'foo bar',
      email: 'foo@bar.com',
    };

    addNewContact(newRow + 1, contact2.name, contact2.email);
    const contact3 = {
      name: 'no name',
      email: 'no@name.com',
    };
    addNewContact(newRow + 2, contact3.name, contact3.email);
    removeContact(newRow);

    existsContactAsync(contact2.name, contact2.email);
    existsContactAsync(contact3.name, contact3.email);
  });

  test('Add, then save should show error', async () => {
    const newRow = integration.authors.length;
    clickById(addBtnTestId);
    clickById(`${ContactBtnTestIds.SAVE_BTN}${newRow}`);
    await waitFor(() => {
      const nameRequired = screen.getByText(ContactsErrorMsg.NAME_REQUIRED);
      expect(nameRequired).toBeInTheDocument();
    });
    const emailRequired = screen.getByText(ContactsErrorMsg.EMAIL_REQUIRED);
    expect(emailRequired).toBeInTheDocument();
  });

  test('Add, click edit', async () => {
    const newRow = integration.authors.length;
    clickById(addBtnTestId);
    clickById(`${ContactBtnTestIds.EDIT_BTN}${newRow - 1}`);
    const editContact = integration.authors[newRow - 1];
    await waitFor(() => {
      const contactNameInput = screen.getByDisplayValue(editContact.name);
      expect(contactNameInput).toBeInTheDocument();
    });
  });

  test('Should call to get updated integration information when contact is removed', async () => {
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });
    sdkv3.get.mockResolvedValue({ data: { items: [integrationsResponse] } });
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    act(() => {
      render(<ContactsView />, { wrapper });
    });

    // click remove
    const removeRow = 0;
    const removeBtn = screen.getAllByText('Remove')[removeRow];
    act(() => {
      fireEvent.click(removeBtn);
    });

    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
  });
});
