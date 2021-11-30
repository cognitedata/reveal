import { renderHook } from '@testing-library/react-hooks';

import { getFlow, AuthFlow } from '@cognite/auth-utils';

import { useIdToken } from 'hooks/useIdToken';

jest.mock('@cognite/auth-utils', () => ({
  getFlow: jest.fn(),
}));

describe('useIdToken hook', () => {
  test('should return false if we pass useIdToken as false', () => {
    (getFlow as jest.Mock).mockImplementation((): { flow: AuthFlow } => ({
      flow: 'AZURE_AD',
    }));

    const { result, waitForNextUpdate } = renderHook(() => useIdToken(false));
    waitForNextUpdate();
    expect(result.current).toBeFalsy();
  });

  test('should return false if we pass useIdToken as true but flow is COGNITE_AUTH', () => {
    (getFlow as jest.Mock).mockImplementation((): { flow: AuthFlow } => ({
      flow: 'COGNITE_AUTH',
    }));
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(true));
    waitForNextUpdate();
    expect(result.current).toBeFalsy();
  });

  test('should return true if useIdToken is true and flow is AZURE_AD', async () => {
    (getFlow as jest.Mock).mockImplementation((): { flow: AuthFlow } => ({
      flow: 'AZURE_AD',
    }));
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(true));
    waitForNextUpdate();
    expect(result.current).toBeTruthy();
  });

  test('should return true if useIdToken is true and flow is FAKE_IDP', async () => {
    (getFlow as jest.Mock).mockImplementation((): { flow: AuthFlow } => ({
      flow: 'FAKE_IDP',
    }));
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(true));
    waitForNextUpdate();
    expect(result.current).toBeTruthy();
  });

  test('should return true if useIdToken is true and flow is UNKNOWN', async () => {
    (getFlow as jest.Mock).mockImplementation((): { flow: AuthFlow } => ({
      flow: 'UNKNOWN',
    }));
    const { result, waitForNextUpdate } = renderHook(() => useIdToken(true));
    waitForNextUpdate();
    expect(result.current).toBeTruthy();
  });
});
