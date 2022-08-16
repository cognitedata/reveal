import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { getEmptyAppliedFilterType } from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';

import { AuthorFilter } from '../AuthorFilter';

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

jest.mock('domain/documents/service/queries/useDocumentAuthorsQuery', () => ({
  useDocumentAuthorsQuery: () => {
    return [
      {
        label: 'Item A',
        value: 'item-a',
        documentCount: 1,
      },
      {
        label: 'Item B',
        value: 'item-b',
        documentCount: 2,
      },
    ];
  },
}));

describe('Should render the AuthorFilter checkbox with values from a query', () => {
  const page = (viewStore: Store, viewProps?: any) => {
    return testRenderer(
      (props) => (
        <AuthorFilter title="Authors" data={[]} category="" {...props} />
      ),
      viewStore,
      viewProps
    );
  };

  const defaultTestInit = async (props?: any, selectedItem?: Array<string>) => {
    const store = getMockedStore();
    const appliedFilters = getEmptyAppliedFilterType();
    if (selectedItem) {
      appliedFilters.documents.authors = selectedItem;
    }
    (useFilterAppliedFilters as jest.Mock).mockImplementation(
      () => appliedFilters
    );
    return { ...page(store, props) };
  };

  it('should render checkbox filter list as expected', async () => {
    await defaultTestInit();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('should have the Item-A as the selected item', async () => {
    await defaultTestInit({}, ['item-a']);
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });

  it('should allow selection of multiple items', async () => {
    await defaultTestInit({}, ['item-a', 'item-b']);
    expect(
      screen.getAllByText((text) => {
        return text === 'Item A' || text === 'Item B';
      })
    ).toHaveLength(2);
  });
});
