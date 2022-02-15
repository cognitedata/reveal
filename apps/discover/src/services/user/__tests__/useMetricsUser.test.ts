import { renderHook } from '@testing-library/react-hooks';
import { useUserProfileQuery } from 'services/user/useUserQuery';

import { useAuthContext } from '@cognite/react-container';

import { useMetricsUser } from '../useMetricsUser';

jest.mock('@cognite/react-container', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('services/user/useUserQuery', () => ({
  useUserProfileQuery: jest.fn(),
}));

describe('useMetricsUser hook', () => {
  beforeEach(() => {
    (useAuthContext as jest.Mock).mockImplementation(() => ({
      authState: {
        email: 'testuser@cognite',
      },
    }));
    (useUserProfileQuery as jest.Mock).mockImplementation(() => ({
      data: {
        id: 'testid',
        email: 'testuser@cognite',
        firstname: 'Test',
        lastname: 'User',
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
