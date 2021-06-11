import { renderHook } from '@testing-library/react-hooks';

import { getAuthHeaders } from '../auth';
import { AuthProvider } from '../../components/AuthContainer';

const mock = jest.fn().mockImplementation(() => ({ log: jest.fn() }));

jest.mock('utils/log', mock);

const authState = {
  authState: {
    idToken: 'idToken-test',
    token: 'token-test',
    authenticated: true,
    initialising: false,
  },
};

describe('getAuthHeaders', () => {
  beforeEach(() => {
    delete process.env.REACT_APP_E2E_MODE;
  });

  it('should work with ID token', () => {
    const { result } = renderHook(() => getAuthHeaders({ useIdToken: true }), {
      wrapper: ({ children }) => (
        <AuthProvider.Provider value={authState}>
          {children}
        </AuthProvider.Provider>
      ),
    });

    expect(result.current).toEqual({ Authorization: 'Bearer idToken-test' });
  });

  it('should work with auth token', () => {
    const { result } = renderHook(() => getAuthHeaders(), {
      wrapper: ({ children }) => (
        <AuthProvider.Provider value={authState}>
          {children}
        </AuthProvider.Provider>
      ),
    });

    expect(result.current).toEqual({ Authorization: 'Bearer token-test' });
  });

  it('should fallback to api key if token not found', () => {
    const testKey = 'test-api-key-1';
    process.env.REACT_APP_E2E_MODE = 'true';
    process.env.REACT_APP_API_KEY = testKey;
    const { result } = renderHook(() => getAuthHeaders(), {
      wrapper: ({ children }) => (
        <AuthProvider.Provider
          value={{
            authState: {
              ...authState.authState,
              token: undefined,
              idToken: undefined,
            },
          }}
        >
          {children}
        </AuthProvider.Provider>
      ),
    });

    expect(result.current).toEqual({ 'api-key': testKey });
  });

  it('should default to api key if no token is set', () => {
    process.env.REACT_APP_E2E_MODE = 'true';
    process.env.REACT_APP_API_KEY = '';
    const { result } = renderHook(() => getAuthHeaders());
    expect(result.current).toEqual({ 'api-key': '' });
  });

  it('should use default api header', () => {
    process.env.REACT_APP_E2E_MODE = 'true';
    process.env.REACT_APP_API_KEY = 'test';
    const { result } = renderHook(() => getAuthHeaders());
    expect(result.current).toEqual({ 'api-key': 'test' });
  });

  it('should set custom api header', () => {
    process.env.REACT_APP_E2E_MODE = 'true';
    process.env.REACT_APP_API_KEY = 'test';
    const { result } = renderHook(() =>
      getAuthHeaders({ apiKeyHeader: 'new-header' })
    );
    expect(result.current).toEqual({ 'new-header': 'test' });
  });

  it('should never get api token when not in e2e mode', () => {
    process.env.REACT_APP_API_KEY = 'test';
    const { result } = renderHook(() =>
      getAuthHeaders({ apiKeyHeader: 'new-header' })
    );
    expect(result.current).toEqual({ Authorization: 'Bearer unknown' });
  });
});
