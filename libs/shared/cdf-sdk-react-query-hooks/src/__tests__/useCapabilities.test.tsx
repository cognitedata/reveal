import { useSDK } from '../__mocks__/@cognite/sdk-provider';
import { renderHook } from '@testing-library/react-hooks';

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
const groupsResponse = [{ capabilities }];
const tokenInspectResponse = { data: { capabilities } };

describe('useCapabilities', () => {
  test('Fetches group capabilities if legacy login is used', async () => {
    useSDK.mockReturnValue({
      groups: {
        list: jest.fn().mockResolvedValue(groupsResponse),
      },
    });

    const { result, waitFor } = renderHook(
      () => useCapabilities('COGNITE_AUTH'),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(useSDK().groups.list).toBeCalledTimes(1);
    expect(result.current.data).toEqual(expectedCapabilities);
  });
  test('Fetches group capabilities if OIDC login is used', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result, waitFor } = renderHook(() => useCapabilities('AZURE_AD'), {
      wrapper: renderWithReactQueryCacheProvider(),
    });
    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(useSDK().get).toBeCalledTimes(1);
    expect(result.current.data).toEqual(expectedCapabilities);
  });
});
