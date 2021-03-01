import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import ContactsPage, { INTEGRATION_CONTACTS_HEADING } from './ContactsPage';
import {
  ADD_CONTACT,
  EMAIL_LABEL,
  NAME_LABEL,
  NOTIFICATION_LABEL,
  REMOVE_CONTACT,
  ROLE_LABEL,
} from '../../utils/constants';

describe('ContactsPage', () => {
  beforeEach(() => {
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-contacts`
    );
    render(<ContactsPage />, { wrapper });
  });
  test('Renders', () => {
    expect(screen.getByText(INTEGRATION_CONTACTS_HEADING)).toBeInTheDocument();
    expect(screen.getByText(ADD_CONTACT)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
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
});
