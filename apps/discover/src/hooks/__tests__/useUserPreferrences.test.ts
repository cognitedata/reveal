import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';

import {
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import { testWrapper } from '__test-utils/renderer';
import { UserPreferredUnit } from 'constants/units';

import {
  useUserPreferencesMeasurement,
  useUserPreferencesMeasurementByMeasurementEnum,
} from '../useUserPreferences';

const startServer = (options: Partial<UMSUserProfile> = {}) => {
  const networkMocks = setupServer(getMockUserMe(options));
  networkMocks.listen();
  return () => networkMocks.close();
};

describe('useUserPreferencesMeasurement hook', () => {
  const renderHookWithStore = async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useUserPreferencesMeasurement(),
      {
        wrapper: ({ children }) => testWrapper({ children }),
      }
    );
    await waitForNextUpdate();
    return result.current.data;
  };

  it('Get defaulted to ft when not response from react query', async () => {
    const closeServer = startServer({
      preferences: { measurement: undefined, hidden: false },
    });
    expect(await renderHookWithStore()).toBe(UserPreferredUnit.FEET);
    closeServer();
  });

  it('Return respective unit for unit returned from react query', async () => {
    const closeServer = startServer({
      preferences: { measurement: 'meter', hidden: false },
    });
    expect(await renderHookWithStore()).toBe(UserPreferredUnit.METER);
    closeServer();
  });

  // -it.only('Return error when api return a unit that we do not supports', async () => {
  //   const closeServer = startServer({ measurement: 'millimeter' });
  //   expect(() => renderHookWithStore()).toThrowError(
  //     Error('Unit: milimeter, is not supported')
  //   );
  //   closeServer();
  // });
});

describe('useUserPreferencesMeasurementByMeasurementEnum hook', () => {
  const renderHookWithStore = async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useUserPreferencesMeasurementByMeasurementEnum(),
      {
        wrapper: ({ children }) => testWrapper({ children }),
      }
    );
    await waitForNextUpdate();
    return result.current;
  };

  it('Get defaulted to ft when not response from react query', async () => {
    const closeServer = startServer({
      preferences: { measurement: undefined, hidden: false },
    });
    expect(await renderHookWithStore()).toBe(
      UMSUserProfilePreferences.MeasurementEnum.Feet
    );
    closeServer();
  });

  it('Return respective unit for unit returned from react query', async () => {
    const closeServer = startServer();
    expect(await renderHookWithStore()).toBe(
      UMSUserProfilePreferences.MeasurementEnum.Meter
    );
    closeServer();
  });
});
