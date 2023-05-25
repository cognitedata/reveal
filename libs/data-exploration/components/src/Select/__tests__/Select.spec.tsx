import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

const options = [
  { label: 'orange', value: 'orange' },
  { label: 'apple', value: 'apple' },
];

describe('Select', () => {
  test('Selecting an option from the select', () => {
    const onChange = jest.fn();

    render(
      <Select
        onChange={(newValue) => {
          onChange(newValue);
        }}
        options={options}
      />
    );

    userEvent.click(screen.getByText('Select...'));

    const { label, value } = options[0];

    userEvent.click(screen.getByText(label));

    expect(onChange).toHaveBeenCalledWith({ label, value });
  });

  test('Having selected correct value', () => {
    render(<Select options={options} value={options[0]} />);

    const { label } = options[0];

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test('Clicking clear button should set values to empty state', () => {
    const onChange = jest.fn();

    const { container } = render(
      <Select
        options={options}
        value={options[0]}
        isClearable
        onChange={(nextValue) => {
          onChange(nextValue);
        }}
      />
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const clearButton = container.getElementsByClassName(
      'cogs-select__clear-indicator'
    );

    userEvent.click(clearButton[0]);

    expect(onChange).toBeCalledWith([]);
  });
});
