import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { EditableChip } from './EditableChip';

describe('EditableChip', () => {
  it("Renders placeholder state when there's no value", () => {
    render(<EditableChip isLocked={false} placeholder="lorem" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByTestId('icon-lock')).toBeNull();
    expect(screen.getByText('lorem')).toBeTruthy();
  });

  it('Renders correctly when not locked and value is present', () => {
    render(<EditableChip isLocked={false} placeholder="lorem" value="ipsum" />);

    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.queryByTestId('icon-lock')).toBeNull();
    expect(screen.getByText('ipsum')).toBeTruthy();
  });

  it('Renders correctly when locked', () => {
    render(<EditableChip isLocked placeholder="lorem" value="ipsum" />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('icon-lock')).toBeTruthy();
    expect(screen.getByText('ipsum')).toBeTruthy();
  });

  it('Renders value in input when value prop changes after mount', () => {
    const { rerender } = render(<EditableChip value={undefined} />);

    rerender(<EditableChip value="lorem" />);
    userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('textbox')).toHaveValue('lorem');
  });

  it('Fires onChange event when user presses enter', () => {
    const handleChange = jest.fn();
    render(<EditableChip value="ipsum" onChange={handleChange} />);

    userEvent.click(screen.getByRole('button'));
    userEvent.type(screen.getByRole('textbox'), '-dolor{enter}');

    expect(handleChange).toHaveBeenCalledWith('ipsum-dolor');
  });

  it('Does not fire onChange event when user presses esc', () => {
    const handleChange = jest.fn();
    render(<EditableChip value="ipsum" onChange={handleChange} />);

    userEvent.click(screen.getByRole('button'));
    userEvent.type(screen.getByRole('textbox'), '-dolor{escape}');

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('Does not fire onChange event for empty value', () => {
    const handleChange = jest.fn();
    render(<EditableChip value="a" onChange={handleChange} />);

    userEvent.click(screen.getByRole('button'));
    userEvent.type(screen.getByRole('textbox'), '{backspace}{enter}');

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("Does not fire onChange event if value didn't change", () => {
    const handleChange = jest.fn();
    render(<EditableChip value="a" onChange={handleChange} />);

    userEvent.click(screen.getByRole('button'));
    userEvent.type(screen.getByRole('textbox'), 'b{backspace}{enter}');

    expect(handleChange).not.toHaveBeenCalled();
  });
});
