import React from 'react';
import { QueryClient } from 'react-query';
import { screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { act } from 'react-test-renderer';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { getMockResponse, mockError } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import {
  ADD_CONTACT_TEST_ID,
  addNewContact,
  clickById,
  clickByIdAsync,
  existsContactAsync,
  CONTACT_EMAIL_TEST_ID,
  CONTACT_NAME_TEST_ID,
  CONTACT_NOTIFICATION_TEST_ID,
  removeContact,
} from '../../utils/test/utilsFn';
import { renderQueryCacheIntegration } from '../../utils/test/render';
import ContactsView, {
  ContactBtnTestIds,
  ContactsErrorMsg,
} from './ContactsView';
import { Integration } from '../../model/Integration';
import { User } from '../../model/User';
import { SERVER_ERROR_TITLE } from '../buttons/ErrorMessageDialog';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import {
  CANCEL,
  EMAIL_NOTIFICATION_TOOLTIP,
  REMOVE,
} from '../../utils/constants';

function createIntegrationWithContacts(
  contacts: User[] | undefined | null
): Integration {
  const int = getMockResponse()[0];
  return { ...int, contacts } as Integration;
}

describe('<ContactsView />', () => {
  let client: QueryClient;
  const integration = getMockResponse()[0];

  const DIALOG_TEXT_REGEX = new RegExp(/are you sure you want to remove/, 'i');
  beforeEach(() => {
    client = new QueryClient();
    const wrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<ContactsView />, { wrapper });
  });
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  test('Show error when server error', async () => {
    sdkv3.post.mockRejectedValue(mockError);
    const row = 0;
    const editBtn = screen.getByTestId(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    fireEvent.click(editBtn);
    const editContact = integration.contacts[row];
    const contactEmailInput = screen.getByDisplayValue(editContact.email);
    fireEvent.change(contactEmailInput, {
      target: { value: 'sdfsdf@test.no' },
    });
    fireEvent.blur(contactEmailInput);

    const saveBtn = screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}${row}`);
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(SERVER_ERROR_TITLE)).toBeInTheDocument();
    });
    const OKBtn = screen.getByText('OK');
    fireEvent.click(OKBtn);
    await waitFor(() => {
      expect(screen.getByText(editContact.email)).toBeInTheDocument();
    });
  });

  test('Edit - interact with notification', async () => {
    const row = 0;
    const editBtn = screen.getByTestId(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    fireEvent.click(editBtn);
    const sendNotificationCheckbox = screen.getAllByLabelText(
      EMAIL_NOTIFICATION_TOOLTIP
    )[0];
    expect(
      screen.queryByTestId(`warning-icon-contacts-${row}`)
    ).not.toBeInTheDocument();
    expect(sendNotificationCheckbox.checked).toEqual(false);
    fireEvent.click(sendNotificationCheckbox);
    expect(sendNotificationCheckbox.checked).toEqual(true);
    expect(
      screen.getByTestId(`warning-icon-contacts-${row}`)
    ).toBeInTheDocument();

    const cancelBtn = screen.getByTestId(`cancel-contact-btn-${row}`);
    fireEvent.click(cancelBtn);
    await waitFor(() => {
      expect(sendNotificationCheckbox.checked).toEqual(false);
    });
    fireEvent.click(editBtn);
    expect(
      screen.queryByTestId(`warning-icon-contacts${row}`)
    ).not.toBeInTheDocument();
    fireEvent.click(sendNotificationCheckbox);
    expect(sendNotificationCheckbox.checked).toEqual(true);
  });

  test('Invalid email validation and text change warning', async () => {
    const row = 0;
    const editBtn = screen.getByTestId(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    fireEvent.click(editBtn);
    const editContact = integration.contacts[row];
    act(() => {
      const contactEmailInput = screen.getByDisplayValue(editContact.email);
      fireEvent.change(contactEmailInput, { target: { value: 'sdfsdf' } });
      fireEvent.blur(contactEmailInput);
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(`warning-icon-contacts-${row}`)
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

  test('add contact default values', async () => {
    await clickByIdAsync(ADD_CONTACT_TEST_ID);
    const newRow = integration.contacts.length;
    expect(
      screen.getByTestId(`${CONTACT_EMAIL_TEST_ID}${newRow}`).value
    ).toEqual('');
    expect(
      screen.getByTestId(`${CONTACT_NAME_TEST_ID}${newRow}`).value
    ).toEqual('');
    expect(
      screen.getByTestId(`${CONTACT_NOTIFICATION_TEST_ID}${newRow}`).checked
    ).toEqual(false);
  });

  test('add 3, remove first of new', () => {
    const newRow = integration.contacts.length + 1;
    sdkv3.post.mockResolvedValue({ data: { items: [] } });
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
    const newRow = integration.contacts.length;
    clickById(ADD_CONTACT_TEST_ID);
    const save = await screen.findByTestId(
      `${ContactBtnTestIds.SAVE_BTN}${newRow}`
    );
    fireEvent.click(save);
    await waitFor(() => {
      const nameRequired = screen.getByText(ContactsErrorMsg.NAME_REQUIRED);
      expect(nameRequired).toBeInTheDocument();
    });
    const emailRequired = screen.getByText(ContactsErrorMsg.EMAIL_REQUIRED);
    expect(emailRequired).toBeInTheDocument();
  });

  test('Add, click edit', async () => {
    const newRow = integration.contacts.length;
    clickById(ADD_CONTACT_TEST_ID);
    clickById(`${ContactBtnTestIds.EDIT_BTN}${newRow - 1}`);
    const editContact = integration.contacts[newRow - 1];
    await waitFor(() => {
      const contactNameInput = screen.getByDisplayValue(editContact.name);
      expect(contactNameInput).toBeInTheDocument();
    });
  });

  test('Remove dialog - interact with remove dialog', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [] } });
    const removeRow = 0;
    const removeBtn = screen.getAllByText(REMOVE)[removeRow];
    await waitFor(() => {
      expect(screen.queryByText(DIALOG_TEXT_REGEX)).not.toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(removeBtn);
    });
    await waitFor(() => {
      expect(screen.getByText(DIALOG_TEXT_REGEX)).toBeInTheDocument();
    });

    const cancel = screen.getByText(CANCEL);
    expect(cancel).toBeInTheDocument();
    act(() => {
      fireEvent.click(cancel);
    });

    await waitFor(() => {
      expect(screen.queryByText(DIALOG_TEXT_REGEX)).not.toBeVisible();
    });

    fireEvent.click(removeBtn);

    const confirmRemove = screen.getAllByText(REMOVE)[removeRow + 1];
    fireEvent.click(confirmRemove);
    await waitFor(() => {
      expect(screen.queryByText(DIALOG_TEXT_REGEX)).not.toBeInTheDocument();
    });
  });

  test('Should call to get updated integration information when contact is removed', async () => {
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });
    sdkv3.get.mockResolvedValue({ data: { items: [integrationsResponse] } });
    const wrapper = renderQueryCacheIntegration(
      client,
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
    const removeBtn = screen.getAllByText(REMOVE)[removeRow];
    fireEvent.click(removeBtn);
    expect(sdkv3.post).toHaveBeenCalledTimes(0);
    await waitFor(() => {
      expect(screen.getByText(DIALOG_TEXT_REGEX)).toBeInTheDocument();
    });

    const confirmRemove = screen.getAllByText(REMOVE)[removeRow + 1];
    fireEvent.click(confirmRemove);

    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
  });
});

test('Should render when contacts is empty array', async () => {
  const modifiedIntegration = createIntegrationWithContacts([]);
  expect(modifiedIntegration.contacts.length).toEqual(0);
  const client = new QueryClient();
  const thisWrapper = renderQueryCacheIntegration(
    client,
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    modifiedIntegration
  );
  act(() => {
    render(<ContactsView />, { wrapper: thisWrapper });
  });
  const renderedContacts = screen.queryAllByText('Contact');
  expect(renderedContacts.length).toEqual(0);
});
test('Should render when contacts is undefined', async () => {
  const modifiedIntegration = createIntegrationWithContacts(undefined);
  expect(modifiedIntegration.contacts).toEqual(undefined);
  const client = new QueryClient();
  const thisWrapper = renderQueryCacheIntegration(
    client,
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    modifiedIntegration
  );
  act(() => {
    render(<ContactsView />, { wrapper: thisWrapper });
  });
  const renderedContacts = screen.queryAllByText('Contact');
  expect(renderedContacts.length).toEqual(0);
});
test('Should render when contacts is null', async () => {
  const modifiedIntegration = createIntegrationWithContacts(null);
  expect(modifiedIntegration.contacts).toEqual(null);
  const client = new QueryClient();
  const thisWrapper = renderQueryCacheIntegration(
    client,
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    modifiedIntegration
  );
  act(() => {
    render(<ContactsView />, { wrapper: thisWrapper });
  });
  const renderedContacts = screen.queryAllByText('Contact');
  expect(renderedContacts.length).toEqual(0);
});
test('Should render 2 contacts when there are 2 contacts', async () => {
  const modifiedIntegration = createIntegrationWithContacts([
    { name: 'test1 test', email: 'test1@test.no' },
    { name: 'foo', email: 'foo@test.no' },
  ]);
  expect(modifiedIntegration.contacts.length).toEqual(2);
  const client = new QueryClient();
  const thisWrapper = renderQueryCacheIntegration(
    client,
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    modifiedIntegration
  );
  act(() => {
    render(<ContactsView />, { wrapper: thisWrapper });
  });
  const renderedContacts = screen.queryAllByText('Contact');
  expect(renderedContacts.length).toEqual(2);
});

test('Should render when there is only name', async () => {
  const user = { name: 'test1 test' };
  const modifiedIntegration = createIntegrationWithContacts([user]);
  expect(modifiedIntegration.contacts.length).toEqual(1);
  const client = new QueryClient();
  const thisWrapper = renderQueryCacheIntegration(
    client,
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    modifiedIntegration
  );
  act(() => {
    render(<ContactsView />, { wrapper: thisWrapper });
  });
  const renderedContacts = screen.queryAllByText('Contact');
  expect(renderedContacts.length).toEqual(1);
  expect(screen.getByText(user.name)).toBeInTheDocument();
});

test('Should render when there is only email', async () => {
  const userEmail = 'test1@test.no';
  const author1Email = createIntegrationWithContacts([{ email: userEmail }]);
  expect(author1Email.contacts.length).toEqual(1);
  const client = new QueryClient();
  const thisWrapper = renderQueryCacheIntegration(
    client,
    PROJECT_ITERA_INT_GREEN,
    CDF_ENV_GREENFIELD,
    ORIGIN_DEV,
    author1Email
  );
  act(() => {
    render(<ContactsView />, { wrapper: thisWrapper });
  });
  const renderedContacts = screen.queryAllByText('Contact');
  expect(renderedContacts.length).toEqual(1);
  const renderedEmail = screen.getByText(userEmail);
  expect(renderedEmail).toBeInTheDocument();
  expect(renderedEmail.getAttribute('href')).toEqual(`mailto:${userEmail}`);
});
