import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StringInput } from './StringInput';

describe('StringFilter', () => {
  test('Typing "hello" into the filter bar', () => {
    const onChange = jest.fn();

    render(
      <StringInput
        onChange={(nextString) => {
          onChange(nextString);
        }}
      />
    );

    const inputElement = screen.getByRole('textbox');

    expect(screen.queryByTestId('filter-label')).not.toBeInTheDocument();

    expect(inputElement).toBeInTheDocument();
    userEvent.type(inputElement, 'hello');

    expect(onChange).toHaveBeenNthCalledWith(1, 'h');
    expect(onChange).toHaveBeenNthCalledWith(2, 'e');
    expect(onChange).toHaveBeenNthCalledWith(3, 'l');
    expect(onChange).toHaveBeenNthCalledWith(4, 'l');
    expect(onChange).toHaveBeenNthCalledWith(5, 'o');
  });

  test('Check if label appears in the document', () => {
    const label = 'Test label';
    render(<StringInput label={label} />);

    const labelElement = screen.getByTestId('filter-label');

    expect(labelElement).toBeInTheDocument();
    expect(labelElement.textContent).toBe(label);
  });
});
