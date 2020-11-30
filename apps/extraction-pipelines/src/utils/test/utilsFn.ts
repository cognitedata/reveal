import { fireEvent, screen } from '@testing-library/react';

export const typeInput = (testId: string, text: string) => {
  const input = screen.getByTestId(testId);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.blur(input);
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
