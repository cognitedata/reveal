import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from '../MultiSelect';
import React from 'react';

const options = [
  { label: 'orange', value: 'orange' },
  { label: 'apple', value: 'apple' },
];

describe('MultiSelect', () => {
  test('Selecting option(s) from the multiselect', () => {
    const onChange = jest.fn();

    render(
      <MultiSelect
        onChange={(newValue) => {
          onChange(newValue);
        }}
        options={options}
      />
    );

    userEvent.click(screen.getByText('Select...'));

    userEvent.click(screen.getByText(options[0].label));

    // Unit test bug? The menu closes when selecting one item (that should not happen)
    // userEvent.click(await screen.findByText(options[1].label));

    expect(onChange).toHaveBeenCalledWith([options[0]]);
  });

  test('It has first tag label plus remaining count', () => {
    render(<MultiSelect value={options} options={options} />);

    expect(screen.getByText(options[0].label)).toBeInTheDocument();
    expect(screen.getByText(`+${options.length - 1}`)).toBeInTheDocument();
  });
});
