import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type CogniteClient, type Model3D } from '@cognite/sdk';
import { renderHook, waitFor } from '@testing-library/react';
import { useAll3dModels } from '../../../src/hooks/useAll3dModels';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get3dModels } from '../../../src/hooks/network/get3dModels';

const models: Model3D[] = [
  {
    id: 1,
    name: 'model1',
    createdTime: new Date()
  },
  {
    id: 2,
    name: 'model2',
    createdTime: new Date()
  },
  {
    id: 3,
    name: 'model3',
    createdTime: new Date()
  },
  {
    id: 4,
    name: 'model4',
    createdTime: new Date()
  }
];

const sdk = {
  post: vi.fn().mockResolvedValue({ data: {} }),
  project: 'project'
} as unknown as CogniteClient;

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: any }): any => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('../../../src/hooks/network/get3dModels');

describe('useAll3dModels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  test('should return a list of models', async () => {
    vi.mocked(get3dModels).mockResolvedValue(models);

    const { result } = renderHook(() => useAll3dModels(sdk, true), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(models);
    });
  });

  test('should return an empty list of models if no models exist', async () => {
    vi.mocked(get3dModels).mockResolvedValue([]);
    const { result } = renderHook(() => useAll3dModels(sdk, true), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  test('should return undefined if not enabled', async () => {
    const { result } = renderHook(() => useAll3dModels(sdk, false), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(undefined);
    });
  });
});
