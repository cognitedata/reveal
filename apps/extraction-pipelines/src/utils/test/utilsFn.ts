import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ContactBtnTestIds } from '../../components/form/ContactsView';
import {
  ADD_CONTACT_TEST_ID,
  CONTACT_EMAIL_TEST_ID,
  CONTACT_NAME_TEST_ID,
} from '../constants';

export const DETAILS_ELEMENTS = {
  UNSAVED: /Unsaved information/i,
};

export const DETAILS_TEST_IDS = {
  FOOTER_CLOSE_MODAL: 'footer-modal-close-btn',
  CLOSE_CONFIRM_DIALOG: 'confirm-dialog',
};

export const existsContactAsync = async (name: string, email: string) => {
  await waitFor(() => {
    const nameText = screen.getByText(name);
    expect(nameText).toBeInTheDocument();
  });
  await waitFor(() => {
    const emailText = screen.getByText(email);
    expect(emailText).toBeInTheDocument();
  });
};

export const typeInInputAsync = async (testId: string, text: string) => {
  await waitFor(() => {
    const input = screen.getByTestId(testId);
    fireEvent.change(input, { target: { value: text } });
    fireEvent.blur(input);
  });
};

export const existsByText = async (text: string) => {
  await waitFor(() => {
    const displayText = screen.getByText(text);
    expect(displayText).toBeInTheDocument();
  });
};
export const notExistsText = async (text: string) => {
  await waitFor(() => {
    const displayText = screen.queryByText(text);
    expect(displayText).not.toBeInTheDocument();
  });
};

export const existsByIdAsync = async (testId: string) => {
  await waitFor(() => {
    const input = screen.getByTestId(testId);
    expect(input).toBeInTheDocument();
  });
};
export const notExistsById = (testId: string) => {
  const input = screen.queryByTestId(testId);
  expect(input).not.toBeInTheDocument();
};

export const notExistsByIdAsync = async (testId: string) => {
  await waitFor(() => {
    const input = screen.queryByTestId(testId);
    expect(input).not.toBeInTheDocument();
  });
};

export const clickById = (testId: string) => {
  const btn = screen.getByTestId(testId);
  fireEvent.click(btn);
};

export const clickByIdAsync = async (testId: string) => {
  await waitFor(() => {
    const btn = screen.getByTestId(testId);
    fireEvent.click(btn);
  });
};

export const clickText = async (text: string) => {
  await waitFor(() => {
    const btn = screen.getByText(text);
    fireEvent.click(btn);
  });
};

export const removeContact = async (newRow: number) => {
  await clickByIdAsync(`${ContactBtnTestIds.REMOVE_BTN}${newRow}`);
  await notExistsByIdAsync(`${CONTACT_NAME_TEST_ID}${newRow}`);
  await notExistsByIdAsync(`${CONTACT_EMAIL_TEST_ID}${newRow}`);
};

export const addNewContact = async (
  newRow: number,
  name: string,
  email: string
) => {
  await clickByIdAsync(ADD_CONTACT_TEST_ID);
  await existsByIdAsync(`${CONTACT_NAME_TEST_ID}${newRow}`);
  await existsByIdAsync(`${CONTACT_EMAIL_TEST_ID}${newRow}`);
  await typeInInputAsync(`${CONTACT_NAME_TEST_ID}${newRow}`, name);
  await typeInInputAsync(`${CONTACT_EMAIL_TEST_ID}${newRow}`, email);
  clickById(`${ContactBtnTestIds.SAVE_BTN}${newRow}`);
};
