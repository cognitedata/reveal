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
    projectScope: { projects: ['test-project'] },
  },
  {
    notificationsAcl: {
      actions: ['READ', 'WRITE'],
      scope: { all: {} },
    },
    projectScope: { allProjects: true },
  },
  {
    monitoringAcl: {
      actions: ['READ'],
      scope: { all: {} },
    },
    projectScope: { projects: ['test-project-2'] },
  },
];
const tokenInspectResponse = { data: { capabilities } };

describe('usePermissions', () => {
  test('Returns true if the user has the given capability for any scope', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(() => usePermissions('labelsAcl', 'WRITE'), {
      wrapper: renderWithReactQueryCacheProvider(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test("Returns false if the user doesn't have the given capability for any scope", async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(() => usePermissions('filesAcl', 'WRITE'), {
      wrapper: renderWithReactQueryCacheProvider(),
    });
    await waitFor(() => {
      return result.current.isSuccess;
    });

    expect(result.current.data).toEqual(false);
  });
  test('Returns true if the user has the given capability for given scope', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () =>
        usePermissions('labelsAcl', 'WRITE', {
          datasetScope: { ids: [10101010] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns false if the user has the given capability for the given scope', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result: labelsWriteCheck1 } = renderHook(
      () =>
        usePermissions('labelsAcl', 'WRITE', {
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
        usePermissions('labelsAcl', 'WRITE', {
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
        usePermissions('filesAcl', 'WRITE', {
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
  test("Returns false if the user doesn't have the given capability for any scope", async () => {
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
  test('Returns true if the user has the given capability for given scope', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () =>
        usePermissions('labelsAcl', 'WRITE', {
          datasetScope: { ids: [10101010] },
        }),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns true if the user has the given capability for test-project', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () =>
        usePermissions('labelsAcl', 'WRITE', undefined, undefined, [
          'test-project',
        ]),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns true if the user has the given capability for allProjects', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () =>
        usePermissions('notificationsAcl', 'READ', undefined, undefined, [
          'not-mentioned-project',
        ]),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns false if the user does not have the capability for test-project', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () =>
        usePermissions('monitoringAcl', 'READ', undefined, undefined, [
          'different-project',
        ]),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(false);
  });
  test('Returns true if the user has the capability for a particular project but we do not check for project scope', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result } = renderHook(
      () => usePermissions('notificationsAcl', 'WRITE'),
      {
        wrapper: renderWithReactQueryCacheProvider(),
      }
    );
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current.data).toEqual(true);
  });
  test('Returns false if the user has the given capability for the given scope', async () => {
    useSDK.mockReturnValue({
      get: jest.fn().mockResolvedValue(tokenInspectResponse),
    });

    const { result: labelsWriteCheck1 } = renderHook(
      () =>
        usePermissions('labelsAcl', 'WRITE', {
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
        usePermissions('labelsAcl', 'WRITE', {
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
        usePermissions('filesAcl', 'WRITE', {
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
