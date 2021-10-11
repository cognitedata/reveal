import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getMockAppliedFiltersType } from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  useFilterAppliedFilters,
  useFilterCategory,
} from 'modules/sidebar/selectors';

import Title from '../Title';

const TITLE = 'Test-Title';
const CATEGORY = 'test-category';

jest.mock('modules/sidebar/selectors', () => ({
  useFilterAppliedFilters: jest.fn(),
  useFilterCategory: jest.fn(),
}));

describe('Filters title', () => {
  beforeEach(() => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    (useFilterCategory as jest.Mock).mockImplementation(() => CATEGORY);
  });

  const page = (viewStore: Store, viewProps: any) =>
    testRenderer(Title, viewStore, viewProps);

  const defaultTestInit = async () => {
    const store = getMockedStore();

    return {
      ...page(store, {
        title: TITLE,
        category: CATEGORY,
        iconElement: <span>icon</span>,
        handleClearFilters: jest.fn(),
      }),
    };
  };

  it('should render `Title` with passed TITLE and CATEGORY correctly', async () => {
    await defaultTestInit();

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });
});
