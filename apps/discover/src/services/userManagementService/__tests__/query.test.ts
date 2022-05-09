import '__mocks/mockContainerAuth'; // never miss this import
import { act } from 'react-test-renderer';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';
import { USER_MANAGEMENT_SYSTEM_KEY } from 'constants/react-query';

import {
  getMockUmsUsers,
  getMockUmsUserProfilePreference,
} from '../__fixtures/umsUsers';
import { getMockUserMePatch } from '../__mocks/getMockUserMePatch';
import { getMockUserSearch } from '../__mocks/mockUmsSearch';
import { useAdminUsers, useUserPreferencesMutate } from '../query';

const mockServer = setupServer(getMockUserMePatch(), getMockUserSearch());

describe('useUpdateMyPreferences', () => {
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

describe('useAdminUsers', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected output', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(() =>
      useAdminUsers()
    );
    await waitForNextUpdate();

    expect(result.current.data).toMatchObject(getMockUmsUsers());
  });
});
