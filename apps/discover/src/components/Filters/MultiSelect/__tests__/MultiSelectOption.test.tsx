import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { MultiSelectOption } from '../MultiSelectOption';

describe('MultiSelectOption', () => {
  const page = (viewProps?: {
    value: string;
    count: number;
    isTextCapitalized: boolean;
  }) => testRenderer(MultiSelectOption, undefined, viewProps);

  const defaultTestInit = async (isTextCapitalized = true) => {
    return {
      ...page({
        value: 'test name',
        count: 120,
        isTextCapitalized,
      }),
    };
  };

  it('should render name capitalized', async () => {
    await defaultTestInit();

    expect(screen.queryByTestId('filter-option-label')?.textContent).toEqual(
      'Test name'
    );
  });

  it('should render name not capitalized', async () => {
    await defaultTestInit(false);

    expect(screen.queryByTestId('filter-option-label')?.textContent).toEqual(
      'test name'
    );
  });

  it('should render count as expected', async () => {
    await defaultTestInit();

    expect(screen.getByText(120)).toBeInTheDocument();
  });
});
