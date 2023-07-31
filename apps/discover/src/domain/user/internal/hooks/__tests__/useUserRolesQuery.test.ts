import '__mocks/mockContainerAuth'; // should be first
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';
import { getMockUserRolesLegacyGet } from 'domain/user/service/__mocks/getMockUserRolesLegacyGet';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper } from '__test-utils/renderer';

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
