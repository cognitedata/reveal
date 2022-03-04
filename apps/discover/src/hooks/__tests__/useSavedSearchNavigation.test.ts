import { useHistory } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';
import {
  getMockedEmptySavedSearch,
  getMockedSavedSearchWithFilters,
} from 'services/savedSearches/__fixtures/savedSearch';

import navigation from 'constants/navigation';

import {
  DEFAULT_SAVED_SEARCH_NAVIGATION,
  useSavedSearchNavigation,
} from '../useSavedSearchNavigation';

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
}));

describe('useSavedSearchNavigation hook', () => {
  const historyPush = jest.fn();

  beforeEach(() => {
    (useHistory as jest.Mock).mockImplementation(() => ({ push: historyPush }));
  });

  const getSavedSearchNavigationHandler = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSavedSearchNavigation()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call `history.push` once when `handleSavedSearchNavigation` is called once', async () => {
    const handleSavedSearchNavigation = await getSavedSearchNavigationHandler();
    const savedSearchItem = getMockedEmptySavedSearch();

    handleSavedSearchNavigation(savedSearchItem);

    expect(handleSavedSearchNavigation).toBeTruthy();
    expect(historyPush).toBeCalledTimes(1);
  });

  it('should navigate to default navigation url when saved search item has no filters', async () => {
    const handleSavedSearchNavigation = await getSavedSearchNavigationHandler();
    const savedSearchItem = getMockedEmptySavedSearch();

    handleSavedSearchNavigation(savedSearchItem);

    expect(historyPush).toHaveBeenCalledWith(DEFAULT_SAVED_SEARCH_NAVIGATION);
  });

  it('should navigate to documents search url when saved search item has only documents filters', async () => {
    const handleSavedSearchNavigation = await getSavedSearchNavigationHandler();
    const savedSearchItem = getMockedSavedSearchWithFilters(['documents']);

    handleSavedSearchNavigation(savedSearchItem);

    expect(historyPush).toHaveBeenCalledWith(navigation.SEARCH_DOCUMENTS);
  });

  it('should navigate to wells search url when saved search item has only wells filters', async () => {
    const handleSavedSearchNavigation = await getSavedSearchNavigationHandler();
    const savedSearchItem = getMockedSavedSearchWithFilters(['wells']);

    handleSavedSearchNavigation(savedSearchItem);

    expect(historyPush).toHaveBeenCalledWith(navigation.SEARCH_WELLS);
  });

  it('should navigate to documents search url when saved search item has both documents and wells filters', async () => {
    const handleSavedSearchNavigation = await getSavedSearchNavigationHandler();
    const savedSearchItem = getMockedSavedSearchWithFilters([
      'documents',
      'wells',
    ]);

    handleSavedSearchNavigation(savedSearchItem);

    expect(historyPush).toHaveBeenCalledWith(navigation.SEARCH_DOCUMENTS);
  });
});
