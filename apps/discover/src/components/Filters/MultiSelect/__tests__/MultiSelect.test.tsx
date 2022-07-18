import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testRenderer } from '__test-utils/renderer';

import { MultiSelect } from '../MultiSelect';
import { MultiSelectProps } from '../types';

describe('MultiSelect', () => {
  const page = (viewProps: MultiSelectProps) =>
    testRenderer(MultiSelect, undefined, viewProps);

  const onValueChange = jest.fn();

  const testInit = async (extraProps?: Partial<MultiSelectProps>) => {
    return page({
      options: [],
      title: 'test-title',
      onValueChange,
      isOptionsSorted: true,
      ...extraProps,
    });
  };

  it('should render title as expected', async () => {
    await testInit({ options: ['Option'] });

    expect(screen.getByText('test-title')).toBeInTheDocument();
  });

  it('should render options when passed as a `string[]`', async () => {
    await testInit({ options: ['Option 1', 'Option 2', 'Option 3'] });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should render options when passed as a `MultiSelectOptionObject[]`', async () => {
    await testInit({
      options: [
        { value: 'Option 1', count: 100 },
        { value: 'Option 2', count: 100 },
        { value: 'Option 3', count: 100 },
      ],
    });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should select and de-select all options as expected', async () => {
    await testInit({
      options: [
        { value: 'Option 1', count: 100 },
        { value: 'Option 2', count: 100 },
        { value: 'Option 3', count: 100 },
      ],
      enableSelectAll: true,
      showCustomCheckbox: true,
      SelectAllLabel: 'Select all',
    });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });

    await userEvent.click(screen.getByText('Select all'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });

    let [selectAllCheckbox, ...optionCheckboxes] = screen.getAllByRole(
      'checkbox'
    ) as HTMLInputElement[];
    expect(selectAllCheckbox.checked).toEqual(true);
    optionCheckboxes.forEach((checkbox) =>
      expect(checkbox.checked).toEqual(true)
    );

    // // De-select all
    await userEvent.click(screen.getByText('Select all'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });

    [selectAllCheckbox, ...optionCheckboxes] = screen.getAllByRole(
      'checkbox'
    ) as HTMLInputElement[];
    expect(selectAllCheckbox.checked).toEqual(false);
    optionCheckboxes.forEach((checkbox) =>
      expect(checkbox.checked).toEqual(false)
    );
  });
});
