import { fireEvent, screen, waitFor } from '@testing-library/react';

export const DETAILS_ELEMENTS = {
  UNSAVED: /Unsaved information/i,
};

export const DETAILS_TEST_IDS = {
  FOOTER_CLOSE_MODAL: 'footer-modal-close-btn',
  CLOSE_CONFIRM_DIALOG: 'confirm-dialog',
};

export const typeInput = (testId: string, text: string) => {
  const input = screen.getByTestId(testId);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.blur(input);
};

export const existsText = async (text: string) => {
  const displayText = screen.getByText(text);
  await waitFor(() => {
    expect(displayText).toBeInTheDocument();
  });
};

export const notExistsText = async (text: string) => {
  const displayText = screen.queryByText(text);
  await waitFor(() => {
    expect(displayText).not.toBeInTheDocument();
  });
};

export const existsInput = (testId: string) => {
  const input = screen.getByTestId(testId);
  expect(input).toBeInTheDocument();
};
export const notExistsInput = (testId: string) => {
  const input = screen.queryByTestId(testId);
  expect(input).not.toBeInTheDocument();
};

export const clickId = (testId: string) => {
  const btn = screen.getByTestId(testId);
  fireEvent.click(btn);
};

export const clickText = (text: string) => {
  const btn = screen.getByText(text);
  fireEvent.click(btn);
};
