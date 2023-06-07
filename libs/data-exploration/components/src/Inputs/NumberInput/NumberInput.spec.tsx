import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NumberInput } from './NumberInput';

describe('NumberFilter', () => {
  test('Number input without props renders correctly', () => {
    render(<NumberInput />);

    const inputElement = screen.getByRole('spinbutton');

    expect(screen.queryByTestId('filter-label')).not.toBeInTheDocument();
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue(null);
  });

  test('Checks if label is being rendered correctly', () => {
    const label = 'Test label';
    render(<NumberInput label={label} />);

    expect(screen.getByTestId('filter-label')).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test('Type number string and get valid result back', () => {
    const onChange = jest.fn();
    render(<NumberInput onChange={onChange} />);

    const inputElement = screen.getByRole('spinbutton');

    userEvent.type(inputElement, '123');

    expect(onChange).toHaveBeenLastCalledWith(123);
  });

  test('Type a string and expect no response', () => {
    const onChange = jest.fn();
    render(<NumberInput onChange={onChange} />);

    const inputElement = screen.getByRole('spinbutton');

    userEvent.type(inputElement, 'abc');

    expect(onChange).not.toHaveBeenCalled();
  });

  test('Default value', () => {
    render(<NumberInput value={123} />);

    const inputElement = screen.getByRole('spinbutton');

    expect(inputElement).toHaveValue(123);
  });
});
