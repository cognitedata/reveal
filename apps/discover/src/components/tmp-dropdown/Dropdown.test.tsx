import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Dropdown, Props } from './Dropdown';

describe('Dropdown', () => {
  const options: Props['options'] = [
    { value: 1, display: 'Option 1' },
    { value: 2, display: 'Option 2' },
    { value: 3, display: 'Option 3' },
  ];
  const onChange = jest.fn();

  const defaultTestInit = async (
    props?: Omit<Props, 'options' | 'onChange'>
  ) => ({
    ...testRenderer(Dropdown, undefined, {
      options,
      onChange,
      visible: true,
      ...props,
    }),
  });

  const getDropdownMenuItems = () =>
    screen.getAllByTestId('status-select-items');

  it('should render all options as expected', async () => {
    await defaultTestInit();
    const dropdownMenuItems = getDropdownMenuItems();

    expect(dropdownMenuItems.length).toEqual(options.length);
  });

  it('should call `onChange` as expected', async () => {
    await defaultTestInit();
    const dropdownMenuItems = getDropdownMenuItems();

    fireEvent.click(dropdownMenuItems[0]);
    expect(onChange).toBeCalledTimes(1);
  });
});
