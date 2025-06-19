import { beforeEach, describe, expect, test, vi } from 'vitest';
import { usePointCloudModelRevisionIdsFromReveal } from './usePointCloudModelRevisionIdsFromReveal';
import { type ReactElement, type PropsWithChildren } from 'react';
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

type RevisionDmsResponse = {
  items: { revision: Array<FdmNode<FdmPropertyType<{ model3D: DmsUniqueIdentifier }>>> };
};

const TEST_MODEL_ID0 = 123;
const TEST_MODEL_ID1 = 234;
const TEST_REVISION_ID0 = 3456;
const TEST_REVISION_ID1 = 5678;
const TEST_MODEL_EXTERNAL_ID0 = createModelExternalId(TEST_MODEL_ID0);
const TEST_MODEL_EXTERNAL_ID1 = createModelExternalId(TEST_MODEL_ID1);
const TEST_REVISION_EXTERNAL_ID0 = `cog_3d_revision_${TEST_REVISION_ID0}`;
const TEST_REVISION_EXTERNAL_ID1 = `cog_3d_revision_${TEST_REVISION_ID1}`;
const TEST_SPACE = 'some-space';

const mockUse3dModels = vi.fn<UsePointCloudModelRevisionIdsFromRevealDependencies['use3dModels']>();
const mockUseFdmSdk = vi.fn<UsePointCloudModelRevisionIdsFromRevealDependencies['useFdmSdk']>();

const mockFdmSdkQueryNodesAndEdgesMock =
  vi.fn<(query: QueryRequest) => Promise<RevisionDmsResponse>>();

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
    mockUse3dModels.mockReturnValue([
      createPointCloudDMMock({
        revisionExternalId: TEST_REVISION_EXTERNAL_ID0,
        revisionSpace: TEST_SPACE
      })
    ]);
    mockFdmSdkQueryNodesAndEdgesMock.mockResolvedValue(
      createDmsPointcloudRevisionResponse(
        TEST_MODEL_EXTERNAL_ID0,
        TEST_REVISION_EXTERNAL_ID0,
        TEST_SPACE
      )
    );

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
    expect(result.current.data?.[0]).toEqual({
      modelId: TEST_MODEL_ID0,
      revisionId: TEST_REVISION_ID0,
      type: 'pointcloud'
    });
  });

  test('returns the relevant revision ids for two different point clouds', async () => {
    mockUse3dModels.mockReturnValue([
      createPointCloudDMMock({
        revisionExternalId: TEST_REVISION_EXTERNAL_ID0,
        revisionSpace: TEST_SPACE
      })
    ]);

    mockFdmSdkQueryNodesAndEdgesMock.mockResolvedValueOnce(
      createDmsPointcloudRevisionResponse(
        TEST_MODEL_EXTERNAL_ID0,
        TEST_REVISION_EXTERNAL_ID0,
        TEST_SPACE
      )
    );

    mockUseFdmSdk.mockReturnValue(
      new Mock<FdmSDK>()
        .setup((p) => p.queryNodesAndEdges<QueryRequest>)
        .returns(mockFdmSdkQueryNodesAndEdgesMock)
        .object()
    );

    const { result, rerender } = renderHook(() => usePointCloudModelRevisionIdsFromReveal(), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toEqual({
      modelId: TEST_MODEL_ID0,
      revisionId: TEST_REVISION_ID0,
      type: 'pointcloud'
    });

    mockUse3dModels.mockReturnValue([
      createPointCloudDMMock({
        revisionExternalId: TEST_REVISION_EXTERNAL_ID1,
        revisionSpace: TEST_SPACE
      })
    ]);

    mockFdmSdkQueryNodesAndEdgesMock.mockResolvedValueOnce(
      createDmsPointcloudRevisionResponse(
        TEST_MODEL_EXTERNAL_ID1,
        TEST_REVISION_EXTERNAL_ID1,
        TEST_SPACE
      )
    );

    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]).toEqual({
      modelId: TEST_MODEL_ID1,
      revisionId: TEST_REVISION_ID1,
      type: 'pointcloud'
    });
  });
});

function createDmsPointcloudRevisionResponse(
  modelExternalId: string,
  revisionExternalId: string,
  revisionSpace: string
): RevisionDmsResponse {
  return {
    items: {
      revision: [
        {
          createdTime: 0,
          lastUpdatedTime: 0,
          externalId: revisionExternalId,
          space: revisionSpace,
          version: 1,
          instanceType: 'node',
          properties: {
            cdf_cdm: {
              'Cognite3DRevision/v1': {
                model3D: { externalId: modelExternalId, space: revisionSpace }
              }
            }
          }
        }
      ]
    }
  };
}

function createRevisionExternalId(revisionId: number): string {
  return `cog_3d_revision_${revisionId}`;
}

function createModelExternalId(modelId: number): string {
  return `cog_3d_model_${modelId}`;
}
