import { fireEvent, screen, waitFor } from '@testing-library/react';
import { ContactBtnTestIds } from '../../components/form/ContactsView';

export const DETAILS_ELEMENTS = {
  UNSAVED: /Unsaved information/i,
};

export const DETAILS_TEST_IDS = {
  FOOTER_CLOSE_MODAL: 'footer-modal-close-btn',
  CLOSE_CONFIRM_DIALOG: 'confirm-dialog',
};

export const inputNameTestId = 'authors-name-';
export const inputEmailTestId = 'authors-email-';
export const addBtnTestId = 'add-contact-btn';

export const existsContact = (name: string, email: string) => {
  const nameText = screen.getByText(name);
  const emailText = screen.getByText(email);
  expect(nameText).toBeInTheDocument();
  expect(emailText).toBeInTheDocument();
};

export const existsContactAsync = async (name: string, email: string) => {
  await waitFor(() => {
    const nameText = screen.getByText(name);
    const emailText = screen.getByText(email);
    expect(nameText).toBeInTheDocument();
    expect(emailText).toBeInTheDocument();
  });
};

export const typeInInput = (testId: string, text: string) => {
  const input = screen.getByTestId(testId);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.blur(input);
};
export const typeInInputAsync = async (testId: string, text: string) => {
  await waitFor(() => {
    const input = screen.getByTestId(testId);
    fireEvent.change(input, { target: { value: text } });
    fireEvent.blur(input);
  });
};

export const existsByText = async (text: string) => {
  const displayText = screen.getByText(text);
  expect(displayText).toBeInTheDocument();
};
export const notExistsText = async (text: string) => {
  const displayText = screen.queryByText(text);
  expect(displayText).not.toBeInTheDocument();
};
export const existsById = (testId: string) => {
  const input = screen.getByTestId(testId);
  expect(input).toBeInTheDocument();
};

export const existsByIdAsync = async (testId: string) => {
  const input = await screen.findByTestId(testId);
  expect(input).toBeInTheDocument();
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
  const btn = screen.getByText(text);
  fireEvent.click(btn);
};

export const removeContact = async (newRow: number) => {
  await clickByIdAsync(`${ContactBtnTestIds.REMOVE_BTN}${newRow}`);
  await notExistsByIdAsync(`${inputNameTestId}${newRow}`);
  await notExistsByIdAsync(`${inputEmailTestId}${newRow}`);
};

export const addNewContact = async (
  newRow: number,
  name: string,
  email: string
) => {
  await clickById(addBtnTestId);
  await existsByIdAsync(`${inputNameTestId}${newRow}`);
  await existsByIdAsync(`${inputEmailTestId}${newRow}`);
  typeInInput(`${inputNameTestId}${newRow}`, name);
  typeInInput(`${inputEmailTestId}${newRow}`, email);
  await clickById(`${ContactBtnTestIds.SAVE_BTN}${newRow}`);
};
