import { render, screen, fireEvent } from '@testing-library/react';

import EditableName from '../EditableName';

describe('Configurations/EditableName', () => {
  const onSaveChange = jest.fn().mockReturnValue(true);
  it('Shows the shows the name passed as prop and the edit icon button', () => {
    render(<EditableName name="dummy" onSaveChange={onSaveChange} />);

    expect(screen.getByText('dummy')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
  });
  it('Presses the edit button and change the content of the input', () => {
    render(<EditableName name="dummy" onSaveChange={() => true} />);

    const editButton = screen.getByLabelText('Edit');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    expect(screen.getByText('Cancel')).toBeInTheDocument();

    const inputField = screen.getByRole('textbox', { name: 'editText' });
    expect(inputField).toBeInTheDocument();

    fireEvent.change(inputField, { target: { value: 'test' } });

    const saveButton = screen.getByText('Save', { selector: 'button' });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton!);

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('Clicks the edit button and then the close button', () => {
    render(<EditableName name="dummy" onSaveChange={() => true} />);

    const editButton = screen.getByLabelText('Edit');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    const closeButton = screen.getByText('Cancel', { selector: 'button' });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton!);

    expect(closeButton).not.toBeInTheDocument();
  });

  it('Clicks the edit button and then the "escape" button to cancel', () => {
    render(<EditableName name="dummy" onSaveChange={() => true} />);

    const editButton = screen.getByLabelText('Edit');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    const closeButton = screen.getByText('Cancel', { selector: 'button' });
    expect(closeButton).toBeInTheDocument();

    fireEvent.keyUp(closeButton!, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(closeButton).not.toBeInTheDocument();
  });
});
