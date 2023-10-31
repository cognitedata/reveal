import { renderHook, waitFor } from '@testing-library/react';

import { useSDK } from '../__mocks__/@cognite/sdk-provider';
import { useCapabilities } from '../hooks';
import { renderWithReactQueryCacheProvider } from '../testUtils';

const capabilities = [
  {
    labelsAcl: { actions: ['READ'], scope: { all: {} } },
  },
];
const expectedCapabilities = [
  { acl: 'labelsAcl', actions: ['READ'], scope: { all: {} } },
];
const tokenInspectResponse = { data: { capabilities } };

describe('useCapabilities', () => {
  test('Fetches group capabilities if OIDC login is used', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(() => useCapabilities(), {
      wrapper: renderWithReactQueryCacheProvider(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(useSDK().get).toBeCalledTimes(1);
    expect(result.current.data).toEqual(expectedCapabilities);
  });
});
