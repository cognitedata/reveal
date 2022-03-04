import '__mocks/mockContainerAuth'; // should be first
import 'services/well/__mocks/setupWellsMockSDK';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Store } from 'redux';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockSavedSearchGet } from 'services/savedSearches/__mocks/getMockSavedSearchGet';
import { getMockSearchHistoryGet } from 'services/searchHistory/__mocks/getMockSearchHistoryGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { Search } from '../Search';

jest.mock('../map/Map', () => {
  return () => <div>fake map</div>;
});

const mockServer = setupServer(
  getMockConfigGet(),
  getMockSavedSearchGet(),
  getMockSearchHistoryGet(),
  getMockUserMe()
);

const page = (store: Store) => testRenderer(Search, store);

const defaultTestInit = async () => {
  const store = getMockedStore({
    resultPanel: {
      panelWidth: 1920,
      sortBy: { documents: [] },
    },
  });
  return { ...page(store) };
};

describe('Search', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should render the search content as expected', async () => {
    await defaultTestInit();
    expect(await screen.findByTestId('search-container')).toBeInTheDocument();
  });
});
