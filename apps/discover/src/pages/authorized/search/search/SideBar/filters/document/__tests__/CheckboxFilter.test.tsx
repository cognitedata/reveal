import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import {
  getEmptyAppliedFilterType,
  getMockAppliedFiltersType,
} from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';

import { CheckboxFilter } from '../CheckboxFilter';

jest.mock('modules/documentSearch/selectors', () => ({
  useLabels: jest.fn(() => {
    return { 'unstructured-doctype-TEST_TYPE_1': 'TEST_TYPE_1' };
  }),
  useFilters: jest.fn(),
  useExtractParentFolderPath: jest.fn(),
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
  useAppliedDocumentMapLayerFilters: jest.fn(),
  useAppliedMapGeoJsonFilters: jest.fn(),
}));

jest.mock('../../../components/FilterCollapse', () => ({
  FilterCollapse: {
    Panel: ({ children }: any) => children,
  },
}));

// NOTE (30.04): Figure out how to trigger useEffect such that the category data is rendered
describe('CheckboxFilter without selected values from state', () => {
  beforeEach(() => {
    const appliedFilters = getEmptyAppliedFilterType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
  });
  const page = (viewStore: Store, viewProps?: any) => {
    return testRenderer(
      (props) => (
        <CheckboxFilter
          title="test-title"
          docQueryFacetType="fileCategory"
          category="documents"
          resultFacets={[]}
          categoryData={[
            { name: 'Compressed 1', count: 38463 },
            { name: 'Compressed 2', count: 38463 },
            { name: 'Compressed 3', count: 38463 },
            { name: 'Compressed 4', count: 38463 },
            { name: 'Compressed 5', count: 38463 },
            { name: 'Compressed 6', count: 38463 },
            { name: 'Compressed 7', count: 38463 },
            { name: 'Compressed 8', count: 38463 },
          ]}
          defaultNumberOfItemsToDisplay={2}
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

  it('should render checkbox filter list according to `defaultNumberOfItemsToDisplay` as expected', async () => {
    await defaultTestInit();

    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('should expands and collapse checkbox filter list items as expected', async () => {
    const testInitialRender = () => {
      expect(screen.getByTitle('Compressed 1')).toBeInTheDocument();
      expect(screen.getByTitle('Compressed 2')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
      expect(screen.getByText('View more')).toBeInTheDocument();
      expect(screen.queryByText('View less')).not.toBeInTheDocument();
    };

    await defaultTestInit();

    testInitialRender();

    // Expand
    fireEvent.click(screen.getByText('View more'));

    expect(screen.getByTitle('Compressed 1')).toBeInTheDocument();
    expect(screen.getByTitle('Compressed 8')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(8);
    expect(screen.getByText('View less')).toBeInTheDocument();
    expect(screen.queryByText('View more')).not.toBeInTheDocument();

    // Collapse. Should return to initial render.
    fireEvent.click(screen.getByText('View less'));

    testInitialRender();
  });

  it('should render only checkbox options with valid name', async () => {
    await defaultTestInit({
      categoryData: [
        { name: '', count: 38463 },
        { name: ' ', count: 38463 },
        { name: 'Compressed 1', count: 38463 },
        { name: 'Compressed 2', count: 38463 },
      ],
    });

    const [firstCheckboxLabel, secondCheckboxLabel] = screen.getAllByTestId(
      'filter-checkbox-label'
    ) as HTMLInputElement[];

    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(firstCheckboxLabel).toHaveTextContent('Compressed 1');
    expect(secondCheckboxLabel).toHaveTextContent('Compressed 2');
  });
});

describe('CheckboxFilter with selected values from state', () => {
  beforeEach(() => {
    const appliedFilters = getMockAppliedFiltersType();
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
  });
  const page = (viewStore: Store, viewProps?: any) => {
    return testRenderer(
      (props) => (
        <CheckboxFilter
          title="test-title"
          docQueryFacetType="fileCategory"
          category="documents"
          resultFacets={[]}
          categoryData={[
            { name: 'Compressed', count: 38463 },
            { name: 'Image', count: 38463 },
          ]}
          defaultNumberOfItemsToDisplay={2}
          {...props}
        />
      ),
      viewStore,
      viewProps
    );
  };

  const defaultTestInit = async () => {
    const store = getMockedStore();

    return { ...page(store) };
  };

  it('should check checkboxes as expected', async () => {
    await defaultTestInit();

    const [firstCheckbox] = screen.getAllByRole(
      'checkbox'
    ) as HTMLInputElement[];
    expect(firstCheckbox.checked).toEqual(true);
  });
});
