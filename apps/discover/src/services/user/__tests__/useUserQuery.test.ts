import '__mocks/mockContainerAuth'; // should be first
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testWrapper } from '__test-utils/renderer';

import { getMockUserRolesLegacyGet } from '../__mocks/getMockUserRolesLegacyGet';
import { useUserRoles } from '../useUserQuery';

const networkMocks = setupServer(
  getMockUserRolesLegacyGet(),
  getMockConfigGet()
);

describe('useUserQuery', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  describe('useUserRoles', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHook(() => useUserRoles(), {
        wrapper: testWrapper,
      });
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toEqual({ isAdmin: true, isUser: true });
    });
  });
});
