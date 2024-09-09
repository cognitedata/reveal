import { afterEach, describe, expect, test, vi } from 'vitest';
import { useRevisions } from '../../../src/hooks/useRevisions';
import { type ModelWithRevision } from '../../../src';
import { type CogniteClient, type Model3D } from '@cognite/sdk';
import { useFetchRevisions } from '../../../src/hooks/useFetchRevisions';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const models: Model3D[] = [
  {
    id: 1,
    name: 'model1',
    createdTime: new Date()
  }
];

const modelsWithRevision: ModelWithRevision[] = [
  {
    model: models[0],
    revision: {
      id: 1,
      createdTime: new Date(),
      published: true,
      status: 'Done',
      assetMappingCount: 1,
      fileId: 1
    }
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

vi.mock('../../../src/hooks/useFetchRevisions');

describe('useRevisions', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should return the model with revision', async () => {
    vi.mocked(useFetchRevisions).mockResolvedValue(modelsWithRevision[0]);

    const { result } = renderHook(() => useRevisions(sdk, models), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(modelsWithRevision);
    });
  });

  test('should return undefined if model is undefined', async () => {
    vi.mocked(useFetchRevisions).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRevisions(sdk, undefined), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(undefined);
    });
  });

  test('should return undefined if model is empty', async () => {
    vi.mocked(useFetchRevisions).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRevisions(sdk, []), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(undefined);
    });
  });
});
