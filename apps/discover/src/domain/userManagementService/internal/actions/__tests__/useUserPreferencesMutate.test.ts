import '__mocks/mockContainerAuth'; // never miss this import
import { useUserPreferencesMutate } from 'domain/userManagementService/internal/actions/useUserPreferencesMutate';

import { act } from 'react-test-renderer';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';
import { USER_MANAGEMENT_SYSTEM_KEY } from 'constants/react-query';

import { getMockUmsUserProfilePreference } from '../../../service/__fixtures/getMockUmsUserProfilePreference';
import { getMockUserMePatch } from '../../../service/__mocks/getMockUserMePatch';
import { getMockUserSearch } from '../../../service/__mocks/getMockUserSearch';

export const mockServer = setupServer(
  getMockUserMePatch(),
  getMockUserSearch()
);

describe('useUserPreferencesMutate', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const initiateTest = async () => {
    const { result } = renderHookWithStore(() =>
      useUserPreferencesMutate(USER_MANAGEMENT_SYSTEM_KEY.ME)
    );
    return result.current;
  };

  it('should return expected result', async () => {
    const { mutateAsync } = await initiateTest();

    await act(() =>
      mutateAsync({}).then((response) => {
        expect(response).toEqual(getMockUmsUserProfilePreference());
      })
    );
  });
});
