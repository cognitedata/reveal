import '__mocks/mockCogniteSDK';
import { screen } from '@testing-library/react';

import {
  getMockSidebarState,
  getEmptyAppliedFilterType,
  getMockAppliedFiltersType,
} from '__test-utils/fixtures/sidebar';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { CLEAR_ALL_TEXT } from 'components/tableEmpty/constants';
import { PartialStoreState } from 'core/types';

import {
  DocumentAppliedFilters,
  ClearAllScenarios,
} from '../DocumentAppliedFilters';

describe('DocumentsBulkActions show all filters', () => {
  const DocumentAppliedFiltersComponent = () => {
    return (
      <DocumentAppliedFilters showClearTag showSearchPhraseTag showGeoFilters />
    );
  };
  const defaultTestInit = async (extraState: PartialStoreState = {}) => {
    const store = getMockedStore({
      sidebar: getMockSidebarState(),
      ...extraState,
    });
    return testRenderer(DocumentAppliedFiltersComponent, store);
  };

  it('should render `DocumentAppliedFilters` as expected', async () => {
    await defaultTestInit();
    expect(screen.getByTestId('document-filter-container')).toBeInTheDocument();
  });

  it('no filters or search phrase', async () => {
    await defaultTestInit({
      sidebar: getMockSidebarState({
        searchPhrase: '',
        appliedFilters: getEmptyAppliedFilterType(),
      }),
    });
    expect(screen.queryByText(CLEAR_ALL_TEXT)).not.toBeInTheDocument();
  });

  it('Only search phrase', async () => {
    await defaultTestInit({
      sidebar: getMockSidebarState({
        searchPhrase: 'WELL A',
        appliedFilters: getEmptyAppliedFilterType(),
      }),
    });
    expect(screen.getByText(CLEAR_ALL_TEXT)).toBeInTheDocument();
    expect(screen.getByText('WELL A')).toBeInTheDocument();
  });

  it('Both filters and serach phrase', async () => {
    await defaultTestInit();
    expect(screen.getByText(CLEAR_ALL_TEXT)).toBeInTheDocument();
    expect(screen.getByText('Well A')).toBeInTheDocument();
    expect(screen.getByText('File Type: Compressed')).toBeInTheDocument();
    expect(screen.getByText('Source: Bp-Blob')).toBeInTheDocument();
  });
});

describe('DocumentsBulkActions do not show clear tag and search phrase', () => {
  const DocumentAppliedFiltersComponent = () => {
    return <DocumentAppliedFilters />;
  };
  const defaultTestInit = async (extraState: PartialStoreState = {}) => {
    const store = getMockedStore({
      sidebar: getMockSidebarState(),
      ...extraState,
    });
    return testRenderer(DocumentAppliedFiltersComponent, store);
  };

  it('shows filters only', async () => {
    await defaultTestInit();
    expect(screen.queryByText(CLEAR_ALL_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText('Well A')).not.toBeInTheDocument();
    expect(screen.getByText('File Type: Compressed')).toBeInTheDocument();
    expect(screen.getByText('Source: Bp-Blob')).toBeInTheDocument();
  });
});

describe('DocumentsBulkActions show clear all for filters only', () => {
  const DocumentAppliedFiltersComponent = () => {
    return (
      <DocumentAppliedFilters
        showClearTag
        showClearTagForScenarios={ClearAllScenarios.FILTERS}
      />
    );
  };
  const defaultTestInit = async (extraState: PartialStoreState = {}) => {
    const store = getMockedStore(extraState);
    return testRenderer(DocumentAppliedFiltersComponent, store);
  };

  it('show filters and clear all for filters only', async () => {
    await defaultTestInit({
      sidebar: getMockSidebarState({
        searchPhrase: '',
        appliedFilters: getMockAppliedFiltersType(),
      }),
    });
    expect(screen.getByText(CLEAR_ALL_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('Well A')).not.toBeInTheDocument();
    expect(screen.getByText('File Type: Compressed')).toBeInTheDocument();
    expect(screen.getByText('Source: Bp-Blob')).toBeInTheDocument();
  });
});
