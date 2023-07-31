import { renderHook } from '@testing-library/react-hooks';

import { getAuthHeaders } from '../auth';
import { AuthProvider } from '../../components/AuthProvider/AuthContainer';

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
  it('should work with ID token', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider.Provider value={authState}>
        {children}
      </AuthProvider.Provider>
    );
    const { result } = renderHook(() => getAuthHeaders({ useIdToken: true }), {
      wrapper,
    });

    expect(result.current).toEqual({ Authorization: 'Bearer idToken-test' });
  });

  it('should work with auth token', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider.Provider value={authState}>
        {children}
      </AuthProvider.Provider>
    );
    const { result } = renderHook(() => getAuthHeaders(), {
      wrapper,
    });

    expect(result.current).toEqual({ Authorization: 'Bearer token-test' });
  });
});
