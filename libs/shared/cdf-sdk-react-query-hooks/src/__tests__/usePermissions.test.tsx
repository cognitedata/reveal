import { renderHook, waitFor } from '@testing-library/react';

import { useSDK } from '../__mocks__/@cognite/sdk-provider';
import { usePermissions } from '../hooks';
import { renderWithReactQueryCacheProvider } from '../testUtils';

const capabilities = [
  {
    labelsAcl: { actions: ['READ'], scope: { all: {} } },
  },
  {
    labelsAcl: {
      actions: ['WRITE'],
      scope: { datasetScope: { ids: [10101010] } },
    },
  },
];
const groupsResponse = [{ capabilities }];
const tokenInspectResponse = { data: { capabilities } };

describe('usePermissions', () => {
  test('Returns true if the user has the given capability for any scope (Legacy Login)', async () => {
    useSDK.mockReturnValue({
      groups: {
        list: jest.fn().mockResolvedValue(groupsResponse),
      },
    });

    const { result } = renderHook(
      () => usePermissions('COGNITE_AUTH', 'labelsAcl', 'WRITE'),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test("Returns false if the user doesn't have the given capability for any scope (Legacy Login)", async () => {
    useSDK.mockReturnValue({
      groups: {
        list: jest.fn().mockResolvedValue(groupsResponse),
      },
    });

    const { result } = renderHook(
      () => usePermissions('COGNITE_AUTH', 'filesAcl', 'WRITE'),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(result.current.data).toEqual(false);
  });
  test('Returns true if the user has the given capability for given scope (Legacy Login)', async () => {
    useSDK.mockReturnValue({
      groups: {
        list: jest.fn().mockResolvedValue(groupsResponse),
      },
    });

    const { result } = renderHook(
      () =>
        usePermissions('COGNITE_AUTH', 'labelsAcl', 'WRITE', {
          datasetScope: { ids: [10101010] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns false if the user has the given capability for the given scope (Legacy Login)', async () => {
    useSDK.mockReturnValue({
      groups: {
        list: jest.fn().mockResolvedValue(groupsResponse),
      },
    });

    const { result: labelsWriteCheck1 } = renderHook(
      () =>
        usePermissions('COGNITE_AUTH', 'labelsAcl', 'WRITE', {
          all: {},
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return labelsWriteCheck1.current.isSuccess;
    });

    const { result: labelsWriteCheck2 } = renderHook(
      () =>
        usePermissions('COGNITE_AUTH', 'labelsAcl', 'WRITE', {
          datasetScope: { ids: [20202020] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return labelsWriteCheck2.current.isSuccess;
    });

    const { result: labelsWriteCheck3 } = renderHook(
      () =>
        usePermissions('COGNITE_AUTH', 'filesAcl', 'WRITE', {
          datasetScope: { ids: [10101010] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return labelsWriteCheck3.current.isSuccess;
    });

    expect(labelsWriteCheck1.current.data).toEqual(false);
    expect(labelsWriteCheck2.current.data).toEqual(false);
    expect(labelsWriteCheck3.current.data).toEqual(false);
  });
  test('Returns true if the user has the given capability for any scope (Legacy Login)', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () => usePermissions('AZURE_AD', 'labelsAcl', 'WRITE'),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
      timeout: 10000,
    });
    console.log(result.current);

    // await waitFor(() => expect(result.current.data).toEqual(true));
  });
  test("Returns false if the user doesn't have the given capability for any scope (Legacy Login)", async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () => usePermissions('AZURE_AD', 'filesAcl', 'WRITE'),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(result.current.data).toEqual(false);
  });
  test('Returns true if the user has the given capability for given scope (Legacy Login)', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () =>
        usePermissions('AZURE_AD', 'labelsAcl', 'WRITE', {
          datasetScope: { ids: [10101010] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns false if the user has the given capability for the given scope (Legacy Login)', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result: labelsWriteCheck1 } = renderHook(
      () =>
        usePermissions('AZURE_AD', 'labelsAcl', 'WRITE', {
          all: {},
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return labelsWriteCheck1.current.isSuccess;
    });

    const { result: labelsWriteCheck2 } = renderHook(
      () =>
        usePermissions('AZURE_AD', 'labelsAcl', 'WRITE', {
          datasetScope: { ids: [20202020] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return labelsWriteCheck2.current.isSuccess;
    });

    const { result: labelsWriteCheck3 } = renderHook(
      () =>
        usePermissions('AZURE_AD', 'filesAcl', 'WRITE', {
          datasetScope: { ids: [10101010] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => {
      return labelsWriteCheck3.current.isSuccess;
    });

    expect(labelsWriteCheck1.current.data).toEqual(false);
    expect(labelsWriteCheck2.current.data).toEqual(false);
    expect(labelsWriteCheck3.current.data).toEqual(false);
  });
});
