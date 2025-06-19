import { beforeEach, describe, expect, test, vi } from 'vitest';
import { usePointCloudModelRevisionIdsFromReveal } from './usePointCloudModelRevisionIdsFromReveal';
import { ReactElement, type PropsWithChildren } from 'react';
import {
  UsePointCloudModelRevisionIdsFromRevealContext,
  type UsePointCloudModelRevisionIdsFromRevealDependencies
} from './usePointCloudModelRevisionIdsFromReveal.context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type DmsUniqueIdentifier, type FdmNode, FdmSDK } from '../data-providers/FdmSDK';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createPointCloudDMMock } from '#test-utils/fixtures/pointCloud';
import { Mock } from 'moq.ts';
import { type QueryRequest } from '@cognite/sdk';
import { type FdmPropertyType } from '../components/Reveal3DResources/types';

const mockUse3dModels = vi.fn<UsePointCloudModelRevisionIdsFromRevealDependencies['use3dModels']>();
const mockUseFdmSdk = vi.fn<UsePointCloudModelRevisionIdsFromRevealDependencies['useFdmSdk']>();

const mockFdmSdkQueryNodesAndEdgesMock = vi.fn<
  (query: QueryRequest) => Promise<{
    items: { revision: Array<FdmNode<FdmPropertyType<{ model3D: DmsUniqueIdentifier }>>> };
  }>
>();

const queryClient = new QueryClient();

const wrapper = ({ children }: PropsWithChildren): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <UsePointCloudModelRevisionIdsFromRevealContext.Provider
      value={{
        use3dModels: mockUse3dModels,
        useFdmSdk: mockUseFdmSdk
      }}>
      {children}
    </UsePointCloudModelRevisionIdsFromRevealContext.Provider>
  </QueryClientProvider>
);

describe(usePointCloudModelRevisionIdsFromReveal.name, async () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  test('returns empty result when no models are in the scene', async () => {
    mockUse3dModels.mockReturnValue([]);
    mockUseFdmSdk.mockReturnValue(new FdmSDK(sdkMock));

    const { result } = renderHook(() => usePointCloudModelRevisionIdsFromReveal(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current.data).toHaveLength(0);
  });

  test('returns the relevant revision ids', async () => {
    const modelId = 123;
    const revisionId = 345;
    const testModelExternalId = `cog_3d_model_${modelId}`;
    const testRevisionExternalId = `cog_3d_revision_${revisionId}`;
    const testSpace = 'some-space';

    mockUse3dModels.mockReturnValue([
      createPointCloudDMMock({
        revisionExternalId: testRevisionExternalId,
        revisionSpace: testSpace
      })
    ]);
    mockFdmSdkQueryNodesAndEdgesMock.mockResolvedValue({
      items: {
        revision: [
          {
            createdTime: 0,
            lastUpdatedTime: 0,
            externalId: testRevisionExternalId,
            space: testSpace,
            version: 1,
            instanceType: 'node',
            properties: {
              cdf_cdm: {
                'Cognite3DRevision/v1': {
                  model3D: { externalId: testModelExternalId, space: testSpace }
                }
              }
            }
          }
        ]
      }
    });
    mockUseFdmSdk.mockReturnValue(
      new Mock<FdmSDK>()
        .setup((p) => p.queryNodesAndEdges<QueryRequest>)
        .returns(mockFdmSdkQueryNodesAndEdgesMock)
        .object()
    );

    const { result } = renderHook(() => usePointCloudModelRevisionIdsFromReveal(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toEqual({ modelId, revisionId, type: 'pointcloud' });
  });
});
