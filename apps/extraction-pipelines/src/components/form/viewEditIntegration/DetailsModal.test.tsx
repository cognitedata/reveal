import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { getMockResponse } from '../../../utils/mockResponse';
import { render } from '../../../utils/test';
import {
  clickById,
  existsByText,
  inputEmailTestId,
  inputNameTestId,
  notExistsById,
  notExistsText,
  typeInInput,
  DETAILS_ELEMENTS,
  DETAILS_TEST_IDS,
  existsByIdAsync,
  typeInInputAsync,
  clickByIdAsync,
  existsContactAsync,
  clickText,
} from '../../../utils/test/utilsFn';
import DetailsModal, {
  CLOSE_CONFIRM_CONTENT,
  UNSAVED_INFO_TEXT,
} from './DetailsModal';
import { ContactBtnTestIds } from '../ContactsView';

describe('DetailsModal', () => {
  let wrapper = null;
  const integration = getMockResponse()[0];
  beforeEach(() => {
    jest.resetAllMocks();
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'integrations-ui-style-scope');
    document.body.appendChild(modalRoot);
  });
  afterEach(() => {
    wrapper = null;
  });

  test('Unsaved changes dialog - footer', async () => {
    const cancelMock = jest.fn();

    render(
      <DetailsModal visible onCancel={cancelMock} integration={integration} />,
      { wrapper }
    );
    const row = 1;
    clickById(`${ContactBtnTestIds.EDIT_BTN}${row}`);
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

  test('Add contact', async () => {
    const cancelMock = jest.fn();

    render(
      <DetailsModal visible onCancel={cancelMock} integration={integration} />,
      { wrapper }
    );
    const row = integration.authors.length + 1;
    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);
    existsByIdAsync(`${inputEmailTestId}${row}`);
    existsByIdAsync(`${inputNameTestId}${row}`);
    const newName = 'Test test';
    typeInInputAsync(`${inputNameTestId}${row}`, newName);
    const newEmail = 'test@test.no';
    typeInInputAsync(`${inputEmailTestId}${row}`, newEmail);
    clickByIdAsync(`${ContactBtnTestIds.CANCEL_BTN}${row}`);
    notExistsById(`${inputEmailTestId}${row}`);
    notExistsById(`${inputNameTestId}${row}`);
    clickByIdAsync(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    typeInInputAsync(`${inputNameTestId}${row}`, newName);
    typeInInputAsync(`${inputEmailTestId}${row}`, newEmail);
    existsByText(UNSAVED_INFO_TEXT);
    clickByIdAsync(`${ContactBtnTestIds.SAVE_BTN}${row}`);
    existsContactAsync(newName, newEmail);
    notExistsText(UNSAVED_INFO_TEXT);
  });
});
