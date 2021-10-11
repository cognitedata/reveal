// @todo(PP-2044)
/* eslint-disable testing-library/await-async-utils */
import { screen, fireEvent, waitFor } from '@testing-library/react';

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
    return {
      ...page({
        options,
        title: 'test-title',
        onValueChange,
        isOptionsSorted,
      }),
    };
  };

  it('should render title as expected', async () => {
    await testInit(['Option']);

    expect(screen.getByText('test-title')).toBeInTheDocument();
  });

  it('should render options when passed as a `string[]`', async () => {
    await testInit(['Option 1', 'Option 2', 'Option 3']);

    const multiSelectContainer = screen.getByTestId('multi-select-container');
    fireEvent.click(multiSelectContainer);
    waitFor(() =>
      expect(screen.getAllByTestId('filter-option-label').length).toEqual(3)
    );
  });

  it('should render options when passed as a `MultiSelectOptionObject[]`', async () => {
    await testInit([
      { value: 'Option 1', count: 100 },
      { value: 'Option 2', count: 100 },
      { value: 'Option 3', count: 100 },
    ]);

    const multiSelectContainer = screen.getByTestId('multi-select-container');
    fireEvent.click(multiSelectContainer);
    waitFor(() =>
      expect(screen.getAllByTestId('filter-option-label').length).toEqual(3)
    );
  });

  it('should sort options when `isOptionsSorted` is `true` ignoring case', async () => {
    await testInit(['BB', 'aa', 'cC', 'Dd']);

    const multiSelectContainer = screen.getByTestId('multi-select-container');
    fireEvent.click(multiSelectContainer);

    waitFor(() => {
      const options = screen.getAllByTestId('filter-option-label');

      expect(options[0]).toHaveTextContent('aa');
      expect(options[1]).toHaveTextContent('BB');
      expect(options[2]).toHaveTextContent('cC');
      expect(options[2]).toHaveTextContent('Dd');
    });
  });

  it('should not sort options when `isOptionsSorted` is `false`', async () => {
    await testInit(['Option 2', 'Option 3', 'Option 1'], false);

    const multiSelectContainer = screen.getByTestId('multi-select-container');
    fireEvent.click(multiSelectContainer);

    waitFor(() => {
      const options = screen.getAllByTestId('filter-option-label');

      expect(options[0]).toHaveTextContent('Option 2');
      expect(options[1]).toHaveTextContent('Option 3');
      expect(options[2]).toHaveTextContent('Option 1');
    });
  });
});
