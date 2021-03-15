import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import ContactsPage, { INTEGRATION_CONTACTS_HEADING } from './ContactsPage';
import {
  ADD_CONTACT,
  BACK,
  EMAIL_LABEL,
  NAME_LABEL,
  NOTIFICATION_LABEL,
  REMOVE_CONTACT,
  ROLE_LABEL,
} from '../../utils/constants';
import {
  CONTACTS_PAGE_PATH,
  EXTERNAL_ID_PAGE_PATH,
} from '../../routing/CreateRouteConfig';

describe('ContactsPage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `/:tenant${CONTACTS_PAGE_PATH}`,
    initRegisterIntegration: {},
  };

  test('Renders', () => {
    renderRegisterContext(<ContactsPage />, { ...props });
    expect(screen.getByText(INTEGRATION_CONTACTS_HEADING)).toBeInTheDocument();
    expect(screen.getByText(ADD_CONTACT)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    renderRegisterContext(<ContactsPage />, { ...props });
    const addContact = screen.getByText(ADD_CONTACT);
    fireEvent.click(addContact);
    const nameInput = screen.getByLabelText(NAME_LABEL);
    const nameString = 'My name is';
    fireEvent.change(nameInput, { target: { value: nameString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(nameString)).toBeInTheDocument();
    });
    const emailInput = screen.getByLabelText(EMAIL_LABEL);
    const emailString = 'test@test.no';
    fireEvent.change(emailInput, { target: { value: emailString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(emailString)).toBeInTheDocument();
    });
    const roleInput = screen.getByLabelText(ROLE_LABEL);
    const roleString = 'developer';
    fireEvent.change(roleInput, { target: { value: roleString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(roleString)).toBeInTheDocument();
    });
    const notificationBtn = screen.getByLabelText(NOTIFICATION_LABEL);
    fireEvent.click(notificationBtn);
    await waitFor(() => {
      expect(notificationBtn.getAttribute('aria-checked')).toEqual('true');
    });

    const remove = screen.getByLabelText(REMOVE_CONTACT);
    fireEvent.click(remove);
    expect(screen.queryByLabelText(NOTIFICATION_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ROLE_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(EMAIL_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(NAME_LABEL)).not.toBeInTheDocument();
  });

  test('Add and remove', async () => {
    renderRegisterContext(<ContactsPage />, { ...props });
    const addContact = screen.getByText(ADD_CONTACT);
    fireEvent.click(addContact);
    const nameInput = screen.getAllByLabelText(NAME_LABEL);
    expect(nameInput.length).toEqual(1);

    const remove = screen.getAllByLabelText(REMOVE_CONTACT);
    fireEvent.click(remove[0]);
    expect(screen.queryAllByAltText(NAME_LABEL).length).toEqual(0);
    fireEvent.click(addContact);
    expect(screen.getAllByLabelText(NAME_LABEL).length).toEqual(1);
    fireEvent.click(addContact);
    fireEvent.click(addContact);
    expect(screen.queryAllByLabelText(NAME_LABEL).length).toEqual(3);

    fireEvent.click(screen.getAllByLabelText(REMOVE_CONTACT)[1]);
    expect(screen.getAllByLabelText(NAME_LABEL).length).toEqual(2);
  });

  test('Renders stored value', () => {
    const contact = {
      name: 'My name',
      email: 'my@name.com',
      role: 'developer',
      sendNotification: true,
    };
    const withContact = {
      ...props,
      initRegisterIntegration: { contacts: [contact] },
    };
    renderRegisterContext(<ContactsPage />, { ...withContact });
    const nameInput = screen.getByLabelText(NAME_LABEL) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toEqual(contact.name);

    const emailInput = screen.getByLabelText(EMAIL_LABEL) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toEqual(contact.email);

    const roleInput = screen.getByLabelText(ROLE_LABEL) as HTMLInputElement;
    expect(roleInput).toBeInTheDocument();
    expect(roleInput.value).toEqual(contact.role);

    const sendNotificationInput = screen.getByLabelText(
      NOTIFICATION_LABEL
    ) as HTMLInputElement;
    expect(sendNotificationInput).toBeInTheDocument();
    expect(sendNotificationInput.value).toEqual(`${contact.sendNotification}`);
  });
  test('Back btn path', () => {
    renderRegisterContext(<ContactsPage />, { ...props });
    const back = screen.getByText(BACK);
    const linkPath = back.getAttribute('href');
    expect(linkPath.includes(EXTERNAL_ID_PAGE_PATH)).toEqual(true);
  });
});
