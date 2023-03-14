import { BooleanInput } from './BooleanInput';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('BooleanFilter', () => {
  test('The "all" button should be default selected', () => {
    render(<BooleanInput />);

    const allButton = screen.getByTestId('unset');
    const trueButton = screen.getByTestId('true');
    const falseButton = screen.getByTestId('false');

    expect(allButton.getAttribute('aria-selected')).toBe('true');
    expect(trueButton.getAttribute('aria-selected')).toBe('false');
    expect(falseButton.getAttribute('aria-selected')).toBe('false');
  });

  test('The "true" button should be selected', () => {
    render(<BooleanInput value={true} />);

    const allButton = screen.getByTestId('unset');
    const trueButton = screen.getByTestId('true');
    const falseButton = screen.getByTestId('false');

    expect(allButton.getAttribute('aria-selected')).toBe('false');
    expect(trueButton.getAttribute('aria-selected')).toBe('true');
    expect(falseButton.getAttribute('aria-selected')).toBe('false');
  });

  test('The "false" button should be selected', () => {
    render(<BooleanInput value={false} />);

    const allButton = screen.getByTestId('unset');
    const trueButton = screen.getByTestId('true');
    const falseButton = screen.getByTestId('false');

    expect(allButton.getAttribute('aria-selected')).toBe('false');
    expect(trueButton.getAttribute('aria-selected')).toBe('false');
    expect(falseButton.getAttribute('aria-selected')).toBe('true');
  });

  test('The callback of the onchange upon clicking "unset" should be "undefined"', () => {
    const onChange = jest.fn();

    render(<BooleanInput onChange={(newValue) => onChange(newValue)} />);

    const allButton = screen.getByTestId('unset');
    userEvent.click(allButton);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test('The callback of the onchange upon clicking "true" should be "true"', () => {
    const onChange = jest.fn();

    render(<BooleanInput onChange={(newValue) => onChange(newValue)} />);

    const trueButton = screen.getByTestId('true');
    userEvent.click(trueButton);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('The callback of the onchange upon clicking "false" should be "false"', () => {
    const onChange = jest.fn();

    render(<BooleanInput onChange={(newValue) => onChange(newValue)} />);

    const falseButton = screen.getByTestId('false');
    userEvent.click(falseButton);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
