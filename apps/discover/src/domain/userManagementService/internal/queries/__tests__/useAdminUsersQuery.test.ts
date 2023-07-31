import '__mocks/mockContainerAuth'; // never miss this import
import { useAdminUsersQuery } from 'domain/userManagementService/internal/queries/useAdminUsersQuery';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { getMockUmsUsers } from '../../../service/__fixtures/getMockUmsUsers';
import { getMockUserMePatch } from '../../../service/__mocks/getMockUserMePatch';
import { getMockUserSearch } from '../../../service/__mocks/getMockUserSearch';

export const mockServer = setupServer(
  getMockUserMePatch(),
  getMockUserSearch()
);

describe('useAdminUsersQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected output', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(() =>
      useAdminUsersQuery()
    );
    await waitForNextUpdate();

    expect(result.current.data).toMatchObject(getMockUmsUsers());
  });
});
