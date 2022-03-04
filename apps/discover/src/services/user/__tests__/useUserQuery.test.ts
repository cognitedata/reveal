import '__mocks/mockContainerAuth'; // should be first
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testWrapper } from '__test-utils/renderer';

import { getMockUserGet } from '../__mocks/getMockUserGet';
import { getMockUserPatch } from '../__mocks/getMockUserPatch';
import { getMockUserRolesLegacyGet } from '../__mocks/getMockUserRolesLegacyGet';
import { getMockUserSync } from '../__mocks/getMockUserSync';
import {
  useUserSyncQuery,
  useUserProfileQuery,
  useUserRoles,
  useUserUpdateMutate,
} from '../useUserQuery';

const networkMocks = setupServer(
  getMockUserGet(),
  getMockUserSync(),
  getMockUserRolesLegacyGet(),
  getMockUserPatch(),
  getMockConfigGet()
);

describe('useUserQuery', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  describe('useUserSyncQuery', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHook(() => useUserSyncQuery(), {
        wrapper: testWrapper,
      });
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toEqual(true);
    });
  });

  describe('useUserProfileQuery', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHook(() => useUserProfileQuery(), {
        wrapper: testWrapper,
      });
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toEqual({
        createdTime: '1',
        email: 'test-1-discover@cognite.com',
        firstname: '',
        id: '1:user,name@cognite,com',
        lastUpdatedTime: '1',
        lastname: '',
      });
    });
  });

  describe('useUserRoles', () => {
    it('should be ok', async () => {
      const { result, waitFor } = renderHook(() => useUserRoles(), {
        wrapper: testWrapper,
      });
      await waitFor(() => expect(result.current.isFetched).toEqual(true));
      expect(result.current.data).toEqual({ isAdmin: true, isUser: true });
    });
  });

  describe('useUserUpdateMutate', () => {
    it('should be ok', async () => {
      const { result } = renderHook(() => useUserUpdateMutate(), {
        wrapper: testWrapper,
      });

      result.current({ payload: { firstname: 'test' } });
    });
  });
});
