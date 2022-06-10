import '__mocks/mockCogniteSDK';

import { getMockDocumentSearch } from 'domain/documents/service/__mocks/getMockDocumentSearch';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useDocumentsByIdForFavoritesQuery } from '../useDocumentsByIdForFavoritesQuery';

const mockServer = setupServer();

describe('useDocumentsByIdForFavoritesQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected output with empty input', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentsByIdForFavoritesQuery([]),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual({
      pageParams: [undefined],
      pages: [[]],
    });
  });

  it('should return defined object with valid input', async () => {
    mockServer.use(getMockDocumentSearch());
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentsByIdForFavoritesQuery([1, 2, 3]),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(result.current.data).toBeDefined();
  });
});
