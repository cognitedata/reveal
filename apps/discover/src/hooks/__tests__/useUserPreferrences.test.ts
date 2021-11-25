import { renderHook } from '@testing-library/react-hooks';

import { UserPrefferedUnit } from 'constants/units';
import { useUserPreferencesQuery } from 'modules/userManagementService/query';

import { useUserPreferencesMeasurement } from '../useUserPreferences';

jest.mock('modules/userManagementService/query', () => ({
  useUserPreferencesQuery: jest.fn(),
}));

describe('useUserPreferencesMeasurement hook', () => {
  it('Get defaulted to ft when not response from react query', async () => {
    (useUserPreferencesQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));
    const { result, waitForNextUpdate } = renderHook(() =>
      useUserPreferencesMeasurement()
    );
    waitForNextUpdate();
    expect(result.current).toBe(UserPrefferedUnit.FEET);
  });

  it('Return respective unit for unit returned from react query', async () => {
    (useUserPreferencesQuery as jest.Mock).mockImplementation(() => ({
      data: {
        preferences: {
          measurement: 'meter',
        },
      },
    }));
    const { result, waitForNextUpdate } = renderHook(() =>
      useUserPreferencesMeasurement()
    );
    waitForNextUpdate();
    expect(result.current).toBe(UserPrefferedUnit.METER);
  });

  it('Return error when api return a unit that we do not supports', async () => {
    (useUserPreferencesQuery as jest.Mock).mockImplementation(() => ({
      data: {
        preferences: {
          measurement: 'milimeter',
        },
      },
    }));
    const { result, waitForNextUpdate } = renderHook(() =>
      useUserPreferencesMeasurement()
    );
    waitForNextUpdate();
    expect(result.error).toEqual(Error('Unit: milimeter, is not supported'));
  });
});
