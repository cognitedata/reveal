import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import ContactsPage, { INTEGRATION_CONTACTS_HEADING } from './ContactsPage';
import { ADD_CONTACT } from '../../utils/constants';

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
    const nameInput = screen.getByLabelText('Name');
    const nameString = 'My name is';
    fireEvent.change(nameInput, { target: { value: nameString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(nameString)).toBeInTheDocument();
    });
    const emailInput = screen.getByLabelText('E-mail');
    const emailString = 'test@test.no';
    fireEvent.change(emailInput, { target: { value: emailString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(emailString)).toBeInTheDocument();
    });
    const roleInput = screen.getByLabelText('Role');
    const roleString = 'developer';
    fireEvent.change(roleInput, { target: { value: roleString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(roleString)).toBeInTheDocument();
    });
    const notificationBtn = screen.getByLabelText('Notification');
    fireEvent.click(notificationBtn);
    await waitFor(() => {
      expect(notificationBtn.getAttribute('aria-checked')).toEqual('true');
    });
  });
});
