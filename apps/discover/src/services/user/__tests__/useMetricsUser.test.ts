import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import { renderHook } from '@testing-library/react-hooks';

import { useAuthContext } from '@cognite/react-container';

import { useMetricsUser } from '../useMetricsUser';

jest.mock('@cognite/react-container', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock(
  'domain/userManagementService/internal/queries/useUserInfoQuery',
  () => ({
    useUserInfoQuery: jest.fn(),
  })
);

describe('useMetricsUser hook', () => {
  beforeEach(() => {
    (useAuthContext as jest.Mock).mockImplementation(() => ({
      authState: {
        email: 'testuser@cognite',
      },
    }));
    (useUserInfoQuery as jest.Mock).mockImplementation(() => ({
      data: {
        id: 'testid',
        email: 'testuser@cognite',
        displayName: 'Test User',
      },
    }));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMetricsUser());
    waitForNextUpdate();
    return result.current;
  };

  it('should return metrics user profile', async () => {
    const response = await getHookResult();
    expect(response).toEqual({
      mixpanelUser: {
        $email: 'testuser@cognite',
        $name: 'Test User',
      },
      userId: 'testid',
    });
  });
});
