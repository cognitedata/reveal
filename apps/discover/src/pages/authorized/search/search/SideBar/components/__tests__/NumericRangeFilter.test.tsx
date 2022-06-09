import { screen } from '@testing-library/react';
import { Store } from 'redux';

import {
  getEmptyAppliedFilterType,
  getMockAppliedFiltersType,
} from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';

import { NumericFacetRangeFilter } from '../NumericRangeFilter';

jest.mock('modules/documentSearch/selectors', () => ({
  useLabels: jest.fn(() => {
    return { 'unstructured-doctype-TEST_TYPE_1': 'TEST_TYPE_1' };
  }),
  useFilters: jest.fn(),
}));

jest.mock('modules/map/selectors', () => ({
  useGeoFilter: jest.fn(),
}));

jest.mock('modules/resultPanel/selectors', () => ({
  useSortByOptions: jest.fn(),
}));

jest.mock('modules/sidebar/selectors', () => ({
  useSearchPhrase: jest.fn(),
  useAppliedDocumentFilters: jest.fn(),
  useAppliedWellFilters: jest.fn(),
  useFilterAppliedFilters: jest.fn(),
}));

jest.mock('domain/savedSearches/internal/hooks/useSetDocumentFilters', () => ({
  useSetDocumentFilters: jest.fn(),
}));

jest.mock('../FilterCollapse', () => ({
  FilterCollapse: {
    Panel: ({ children }: any) => children,
  },
}));

describe('NumericRangeFilter tests', () => {
  const page = (viewStore: Store, viewProps?: any) => {
    return testRenderer(
      (props) => (
        <NumericFacetRangeFilter
          title="test-title"
          docQueryFacetType="pageCount"
          category="documents"
          resultFacets={[]}
          categoryData={[
            { name: 1, count: 1 },
            { name: 2, count: 5 },
            { name: 3, count: 4 },
          ]}
          {...props}
        />
      ),
      viewStore,
      viewProps
    );
  };
  const defaultTestInit = async (props?: any) => {
    const store = getMockedStore();

    return { ...page(store, props) };
  };

  it('Should render with provided range data', async () => {
    const appliedFilters = getEmptyAppliedFilterType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    await defaultTestInit();

    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('Should render with selected range from state', async () => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    await defaultTestInit();

    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });
});
