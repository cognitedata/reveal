import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { getMockResponse } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import IntegrationDetails from './IntegrationDetails';

describe('Integration Details', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('Warning in the footer', () => {
    const integration = getMockResponse()[0];
    const cancelMock = jest.fn();
    render(
      <IntegrationDetails
        integration={integration}
        visible
        onCancel={cancelMock}
      />
    );
    const editBtns = screen.getAllByText('Edit');

    // click first edit btn - name
    const firstEditBtn = editBtns[0];
    fireEvent.click(firstEditBtn);
    const inputEdit = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(inputEdit).toBeInTheDocument();

    // click second edit btn - description
    const secondEditBtn = editBtns[1];
    fireEvent.click(secondEditBtn);
    const inputDescription = screen.getByDisplayValue(integration.description); // assuming description is editable
    expect(inputDescription).toBeInTheDocument();

    // click second edit btn - first contact
    const contactEditBtn = editBtns[2];
    fireEvent.click(contactEditBtn);
    const ownerEmail = screen.getByDisplayValue(integration.owner.email); // assuming description is editable
    expect(ownerEmail).toBeInTheDocument();
    const newEmail = 'test@test.no';
    fireEvent.change(ownerEmail, {
      target: { value: newEmail },
    });
    fireEvent.blur(ownerEmail);

    const newValueDescription = 'This is a new description';
    fireEvent.change(inputDescription, {
      target: { value: newValueDescription },
    });
    fireEvent.blur(inputDescription);
    const warningDescription = screen.getByTestId(
      `warning-icon-description--2`
    );
    expect(warningDescription).toBeInTheDocument();

    // check that the bottom warning shows
    const bottomWarning = screen.getByText(/Unsaved information/i);
    expect(bottomWarning).toBeInTheDocument();

    // // change value in input
    const newValueName = 'New integration name something unique';
    fireEvent.change(inputEdit, { target: { value: newValueName } });
    fireEvent.blur(inputEdit);
    const newValueInput = screen.getByDisplayValue(newValueName);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-name--${0}`);
    expect(warning).toBeInTheDocument();

    // should be 3 inputs open.
    const saveBtns = screen.getAllByText('Save');
    expect(saveBtns.length).toEqual(3);

    // click save. new value saved. just display value
    fireEvent.click(saveBtns[0]);
    const newValueForRow = screen.getByText(newValueName);
    expect(newValueForRow).toBeInTheDocument();

    // warning should still be visible when one input is in edit
    const bottomWarningStill = screen.getByText(/Unsaved information/i);
    expect(bottomWarningStill).toBeInTheDocument();

    // cancel input to remove
    const cancel = screen.getAllByText('Cancel');
    fireEvent.click(cancel[0]);
    const bottomWarningNotVisible = screen.queryByText(/Unsaved information/i);
    expect(bottomWarningNotVisible).toBeInTheDocument();
    fireEvent.click(cancel[1]);
    expect(bottomWarningNotVisible).not.toBeInTheDocument();
  });

  test('Add contact', () => {
    const integration = getMockResponse()[0];
    const cancelMock = jest.fn();
    render(
      <IntegrationDetails
        integration={integration}
        visible
        onCancel={cancelMock}
      />
    );
    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);
  });
});
