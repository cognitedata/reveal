import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { Checkboxes } from '../Checkboxes';

jest.mock('modules/documentSearch/selectors', () => ({
  useLabels: jest.fn(() => {
    return { 'unstructured-doctype-TEST_TYPE_1': 'TEST_TYPE_1' };
  }),
}));

describe('Checkboxes', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(Checkboxes, viewStore, viewProps);

  const onCheckboxValueChangeCallback = jest.fn((values: string) => values);

  const defaultTestInit = async () => {
    const store = getMockedStore();

    return {
      ...page(store, {
        title: 'test-title',
        onValueChange: onCheckboxValueChangeCallback,
        hideResultsCount: true,
        data: [
          { name: 'Compressed 1', count: 38463 },
          { name: 'Compressed 2', count: 38463 },
          { name: 'Compressed 3', count: 38463 },
          { name: 'Compressed 4', count: 38463 },
          { name: 'Compressed 5', count: 38463 },
          { name: 'Compressed 6', count: 38463 },
          { name: 'Compressed 7', count: 38463 },
          { name: 'Compressed 8', count: 38463 },
        ],
      }),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it('has correct amount of checkboxes listed', async () => {
    await defaultTestInit();

    expect(screen.getAllByRole('checkbox')).toHaveLength(8);
  });

  it('turns an unchecked checkbox to checked and checked checkbox to unchecked on click', async () => {
    await defaultTestInit();

    const [firstCheckbox] = screen.getAllByRole(
      'checkbox'
    ) as HTMLInputElement[];
    expect(firstCheckbox.checked).toEqual(false);

    // Turns unchecked checkbox to checked.
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toEqual(true);

    // Turns checked checkbox to unchecked.
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toEqual(false);
  });

  it('invokes the `onValueChange` callback as expected', async () => {
    await defaultTestInit();

    const [firstCheckbox] = screen.getAllByRole(
      'checkbox'
    ) as HTMLInputElement[];

    fireEvent.click(firstCheckbox);

    // The first argument of the first call to the function should be Array['Compressed 1'].
    expect(onCheckboxValueChangeCallback).toHaveBeenCalledWith([
      'Compressed 1',
    ]);

    fireEvent.click(firstCheckbox);

    // The first argument of the second call to the function should be an empty array.
    expect(onCheckboxValueChangeCallback).toHaveBeenCalledWith([]);

    // The mock function is called twice.
    expect(onCheckboxValueChangeCallback.mock.calls.length).toEqual(2);
  });
});
