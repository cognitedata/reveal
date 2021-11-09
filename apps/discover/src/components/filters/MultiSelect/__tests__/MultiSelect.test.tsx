import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { MultiSelect } from '../MultiSelect';
import { MultiSelectOptionType } from '../types';

describe('MultiSelect', () => {
  const page = (viewProps?: any) =>
    testRenderer(MultiSelect, undefined, viewProps);

  const onValueChange = jest.fn();

  const testInit = async (
    options: MultiSelectOptionType[],
    isOptionsSorted = true
  ) => {
    page({
      options,
      title: 'test-title',
      onValueChange,
      isOptionsSorted,
    });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });
  };

  it('should render title as expected', async () => {
    await testInit(['Option']);

    expect(screen.getByText('test-title')).toBeInTheDocument();
  });

  it('should render options when passed as a `string[]`', async () => {
    await testInit(['Option 1', 'Option 2', 'Option 3']);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should render options when passed as a `MultiSelectOptionObject[]`', async () => {
    await testInit([
      { value: 'Option 1', count: 100 },
      { value: 'Option 2', count: 100 },
      { value: 'Option 3', count: 100 },
    ]);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });
});
