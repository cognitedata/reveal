import { getMockResponse } from 'utils/mockResponse';
import render from 'utils/test/render';
import React from 'react';
import { ContactsDialogView } from 'components/extpipe/ContactsDialog';
import { fireEvent, screen } from '@testing-library/react';

describe('ContactSection', () => {
  const mock = getMockResponse()[0];

  test('Interact with component', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <ContactsDialogView
        initialContacts={mock.contacts}
        onCancel={onCancel}
        onConfirm={onConfirm}
        showErrors={false}
      />
    );
    screen.getByDisplayValue(mock.contacts[0].name);

    mock.contacts.forEach((c) => {
      expect(screen.getByDisplayValue(c.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(c.email)).toBeInTheDocument();
    });
    const newName = 'New name';
    fireEvent.change(screen.getByDisplayValue(mock.contacts[0].name), {
      target: { value: newName },
    });
    fireEvent.click(screen.getByTestId('confirm'));

    const updatedUsers = onConfirm.mock.calls[0][0];
    expect(updatedUsers[0].name).toEqual('New name');
  });
});
