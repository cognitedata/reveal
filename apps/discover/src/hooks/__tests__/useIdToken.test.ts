import { renderHook } from '@testing-library/react-hooks';

import { useIdToken } from 'hooks/useIdToken';
import { useTenantConfigByKey } from 'hooks/useTenantConfig';

jest.mock('hooks/useTenantConfig', () => ({
  useTenantConfigByKey: jest.fn(),
}));

describe('useIdToken hook', () => {
  test('should return false if we pass useIdToken as false', () => {
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => jest.fn());
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(false));
    waitForNextUpdate();
    expect(result.current).toBeFalsy();
  });

  test('should return false if we pass useIdToken as true but azureConfig is undefined or not enabled', () => {
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(true));
    waitForNextUpdate();
    expect(result.current).toBeFalsy();
  });

  test('should return true if useIdToken is true and azureConfig enabled is true', async () => {
    (useTenantConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        enabled: true,
      },
    }));
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(true));
    waitForNextUpdate();
    expect(result.current).toBeTruthy();
  });
});
