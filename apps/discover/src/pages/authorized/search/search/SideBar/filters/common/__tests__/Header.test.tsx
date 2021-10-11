import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getMockAppliedFiltersType } from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  useFilterBarIsOpen,
  useFilterAppliedFilters,
  useFilterCategory,
} from 'modules/sidebar/selectors';

import Header from '../Header';

const TITLE = 'Test-Title';
const CATEGORY = 'test-category';

jest.mock('modules/sidebar/selectors', () => ({
  useFilterBarIsOpen: jest.fn(),
  useFilterAppliedFilters: jest.fn(),
  useFilterCategory: jest.fn(),
}));

describe('Filters header', () => {
  beforeEach(() => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    (useFilterCategory as jest.Mock).mockImplementation(() => CATEGORY);
  });

  const mockUseFilterBarIsOpen = async (isOpen: boolean) => {
    (useFilterBarIsOpen as jest.Mock).mockImplementation(() => isOpen);
  };

  const page = (viewStore: Store, viewProps: any) =>
    testRenderer(Header, viewStore, viewProps);

  const defaultTestInit = async () => {
    const store = getMockedStore();

    return {
      ...page(store, {
        title: TITLE,
        category: CATEGORY,
        handleClearFilters: jest.fn(),
      }),
    };
  };

  it('should render `Header` with passed TITLE and CATEGORY correctly', async () => {
    await mockUseFilterBarIsOpen(true);
    await defaultTestInit();

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('should not render `Header` when `isOpen` is `false`', async () => {
    await mockUseFilterBarIsOpen(false);
    await defaultTestInit();

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });
});
