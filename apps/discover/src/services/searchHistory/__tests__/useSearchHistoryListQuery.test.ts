import '__mocks/mockContainerAuth'; // should be first
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper } from '__test-utils/renderer';

import { getMockSearchHistory } from '../__fixtures/searchHistory';
import { getMockSearchHistoryGet } from '../__mocks/getMockSearchHistoryGet';
import { useSearchHistoryListQuery } from '../useSearchHistoryQuery';

const networkMocks = setupServer(getMockSearchHistoryGet());

describe('useSearchHistoryListQuery', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  it('should be ok', async () => {
    const { result, waitFor } = renderHook(() => useSearchHistoryListQuery(), {
      wrapper: testWrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toEqual(true));
    expect(result.current.data).toMatchObject(getMockSearchHistory());
  });
});
