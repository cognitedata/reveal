import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { getMockResponse } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import IntegrationDetails, {
  CLOSE_CONFIRM_CONTENT,
  UNSAVED_INFO_TEXT,
} from './IntegrationDetails';
import {
  clickById,
  existsContact,
  existsById,
  existsByText,
  inputEmailTestId,
  inputNameTestId,
  notExistsById,
  notExistsText,
  typeInInput,
  DETAILS_ELEMENTS,
  DETAILS_TEST_IDS,
  clickText,
} from '../../utils/test/utilsFn';
import { ContactBtnTestIds } from '../table/details/ContactTableCols';

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
    const bottomWarning = screen.getByText(DETAILS_ELEMENTS.UNSAVED);
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
    const bottomWarningStill = screen.getByText(DETAILS_ELEMENTS.UNSAVED);
    expect(bottomWarningStill).toBeInTheDocument();

    // cancel input to remove
    const cancel = screen.getAllByText('Cancel');
    fireEvent.click(cancel[0]);
    const bottomWarningNotVisible = screen.queryByText(
      DETAILS_ELEMENTS.UNSAVED
    );
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
    const row = integration.authors.length + 1;
    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);
    existsById(`${inputEmailTestId}${row}`);
    existsById(`${inputNameTestId}${row}`);
    const newName = 'Test test';
    typeInInput(`${inputNameTestId}${row}`, newName);
    const newEmail = 'test@test.no';
    typeInInput(`${inputEmailTestId}${row}`, newEmail);
    clickById(`${ContactBtnTestIds.CANCEL_BTN}${row}`);
    notExistsById(`${inputEmailTestId}${row}`);
    notExistsById(`${inputNameTestId}${row}`);
    clickById(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    typeInInput(`${inputNameTestId}${row}`, newName);
    typeInInput(`${inputEmailTestId}${row}`, newEmail);
    existsByText(UNSAVED_INFO_TEXT);
    clickById(`${ContactBtnTestIds.SAVE_BTN}${row}`);
    existsContact(newName, newEmail);
    notExistsText(UNSAVED_INFO_TEXT);
  });

  test('Unsaved changes dialog - footer', () => {
    const integration = getMockResponse()[0];
    const cancelMock = jest.fn();
    render(
      <IntegrationDetails
        integration={integration}
        visible
        onCancel={cancelMock}
      />
    );
    const row = 1;
    clickById(`edit-contact-btn-${row}`);
    typeInInput(`authors-email-${row}`, 'test@test.no');
    const bottomWarning = screen.getByText(DETAILS_ELEMENTS.UNSAVED);
    expect(bottomWarning).toBeInTheDocument();
    // click close
    clickById(DETAILS_TEST_IDS.FOOTER_CLOSE_MODAL);
    // dialog displayed
    existsByText(CLOSE_CONFIRM_CONTENT);
    // click cancel
    const cancelBtns = screen.getAllByText('Cancel');
    fireEvent.click(cancelBtns[0]);
    // dialog removed
    notExistsText(CLOSE_CONFIRM_CONTENT);

    // click close
    clickById(DETAILS_TEST_IDS.FOOTER_CLOSE_MODAL);
    // dialog displayed
    existsByText(CLOSE_CONFIRM_CONTENT);

    // click confirm
    clickText('Confirm');

    // dialog removed
    notExistsText(CLOSE_CONFIRM_CONTENT);
  });
});
