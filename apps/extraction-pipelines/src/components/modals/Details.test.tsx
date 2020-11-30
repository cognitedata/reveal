import { render } from 'utils/test';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Details from './Details';
import { getMockResponse } from '../../utils/mockResponse';
import { ContactBtnTestIds } from '../table/details/ContactTableCols';
import {
  clickId,
  existsInput,
  notExistsInput,
  typeInput,
} from '../../utils/test/utilsFn';

describe('Details', () => {
  const addChange = jest.fn();
  const removeChange = jest.fn();
  test('Edit - change - cancel', () => {
    const integration = getMockResponse()[0];
    render(
      <Details
        integration={integration}
        addChange={addChange}
        removeChange={removeChange}
      />
    );
    // table exist
    const table = screen.getAllByRole('table');
    expect(table.length).toEqual(2); // details and contacts

    // click first edit btn
    const firstEditBtn = screen.getAllByText('Edit')[0];
    fireEvent.click(firstEditBtn);
    const inputEdit = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(inputEdit).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(inputEdit, { target: { value: newValue } });

    // input should still be displayed
    fireEvent.blur(inputEdit);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const saveBtn = screen.getByText('Save');
    const cancelBtn = screen.getByText('Cancel');
    expect(saveBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // click cancel. resets to original value. no input field
    fireEvent.click(cancelBtn);
    const noCancelBtn = screen.queryByText('Cancel');
    expect(noCancelBtn).not.toBeInTheDocument();
    const originalValue = screen.getByText(integration.name);
    expect(originalValue).toBeInTheDocument();
  });

  test('Edit - change - save', () => {
    const integration = getMockResponse()[0];
    render(
      <Details
        integration={integration}
        addChange={addChange}
        removeChange={removeChange}
      />
    );

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-name--${editRow}`);
    expect(warning).toBeInTheDocument();

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    const noSaveBtn = screen.queryByText('Save');
    expect(noSaveBtn).not.toBeInTheDocument();
    const newValueForRow = screen.getByText(newValue);
    expect(newValueForRow).toBeInTheDocument();
  });

  test('Two edits at the same time', () => {
    const integration = getMockResponse()[0];
    render(
      <Details
        integration={integration}
        addChange={addChange}
        removeChange={removeChange}
      />
    );
    const editBtns = screen.getAllByText('Edit');
    expect(editBtns.length).toEqual(5); // name, description + 3 contacts
    // click first edit btn
    const firstEditBtn = editBtns[0];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // click second edit btn - assumes there are two
    const secondEditBtn = editBtns[1];
    fireEvent.click(secondEditBtn);
    const inputDescription = screen.getByDisplayValue(integration.description); // assuming description is editable
    expect(inputDescription).toBeInTheDocument();

    const newValueDescription = 'This is a new description';
    fireEvent.change(inputDescription, {
      target: { value: newValueDescription },
    });
    fireEvent.blur(inputDescription);
    const warningDescription = screen.getByTestId(
      `warning-icon-description--2` // depends on mapIntegration
    );
    expect(warningDescription).toBeInTheDocument();

    // change value in input
    const newValueName = 'New integration name something unique';
    fireEvent.change(nameInput, { target: { value: newValueName } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValueName);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-name--${0}`);
    expect(warning).toBeInTheDocument();

    // should be two inputs open.
    const saveBtns = screen.getAllByText('Save');
    expect(saveBtns.length).toEqual(2);

    // click save. new value saved. just display value
    fireEvent.click(saveBtns[0]);
    const newValueForRow = screen.getByText(newValueName);
    expect(newValueForRow).toBeInTheDocument();
  });

  test('add 3, remove first of new', () => {
    const integration = getMockResponse()[0];
    render(
      <Details
        integration={integration}
        addChange={addChange}
        removeChange={removeChange}
      />
    );
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

    existsContact(contact2.name, contact2.email);
    existsContact(contact3.name, contact3.email);
  });
});

const inputNameTestId = 'authors-name-';
const inputEmailTestId = 'authors-email-';
const addBtnTestId = 'add-contact-btn';

const existsContact = (name: string, email: string) => {
  const nameText = screen.getByText(name);
  const emailText = screen.getByText(email);
  expect(nameText).toBeInTheDocument();
  expect(emailText).toBeInTheDocument();
};

const removeContact = (newRow: number) => {
  clickId(`${ContactBtnTestIds.REMOVE_BTN}${newRow}`);
  notExistsInput(`${inputNameTestId}${newRow}`);
  notExistsInput(`${inputEmailTestId}${newRow}`);
};

const addNewContact = (newRow: number, name: string, email: string) => {
  clickId(addBtnTestId);
  clickId(`${ContactBtnTestIds.EDIT_BTN}${newRow}`);
  existsInput(`${inputNameTestId}${newRow}`);
  existsInput(`${inputEmailTestId}${newRow}`);
  typeInput(`${inputNameTestId}${newRow}`, name);
  typeInput(`${inputEmailTestId}${newRow}`, email);
  clickId(`${ContactBtnTestIds.SAVE_BTN}${newRow}`);
};
