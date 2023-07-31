import '__mocks/mockContainerAuth'; // should be first

import { getMockFavoritesRemoveSharePost } from 'domain/favorites/service/__mocks/getMockFavoritesRemoveSharePost';

import { act } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { useFavoriteRemoveShareMutate } from '../useFavoritesMutate';

const mockServer = setupServer(getMockFavoritesRemoveSharePost());

const initiateTest = (hook: any) => {
  const { result } = renderHookWithStore(() => hook());
  return result.current;
};

describe('useFavoriteRemoveShareMutate', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected output', async () => {
    const { mutateAsync } = initiateTest(useFavoriteRemoveShareMutate);

    await act(() =>
      mutateAsync({ favoriteId: 'test-id', user: 'test-user' }).then(
        (response: any) => {
          expect(response).toEqual([]);
        }
      )
    );
  });
});
