import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import ContactsPage, { INTEGRATION_CONTACTS_HEADING } from './ContactsPage';

describe('ContactsPage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
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
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Notification')).toBeInTheDocument();
  });

  test('Interact with form', async () => {
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
