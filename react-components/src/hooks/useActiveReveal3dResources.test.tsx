import { describe, expect, test, vi } from 'vitest';
import {
  useActiveReveal3dResources,
  UseActiveReveal3dResourcesContext,
  type UseActiveReveal3dResourcesDependencies
} from './useActiveReveal3dResources';
import { type PropsWithChildren, type ReactElement } from 'react';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { createPointCloudDMMock, createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { Mock } from 'moq.ts';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { createDmsNodeItem } from '#test-utils/dms/createDmsNodeItem';
import { type QueryResult } from '../data-providers/utils/queryNodesAndEdges';
import { renderHook, waitFor } from '@testing-library/react';
import {
  createPointCloudModelExternalId,
  createPointCloudRevisionExternalId
} from '#test-utils/models/createExternalId';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe(useActiveReveal3dResources.name, () => {
  const queryClient = new QueryClient();

  const mockQueryNodesAndEdges = vi.fn<() => Promise<QueryResult<any, any>>>();

  const mockFdmSdk = new Mock<FdmSDK>()
    .setup((p) => p.queryNodesAndEdges)
    .returns(mockQueryNodesAndEdges)
    .object();

  const mockUseFdmSdk = vi.fn(() => mockFdmSdk);

  const mockUseVisibleRevealDomainObjects =
    vi.fn<UseActiveReveal3dResourcesDependencies['useVisibleRevealDomainObjects']>();

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UseActiveReveal3dResourcesContext.Provider
        value={{
          useFdmSdk: mockUseFdmSdk,
          useVisibleRevealDomainObjects: mockUseVisibleRevealDomainObjects
        }}>
        {children}
      </UseActiveReveal3dResourcesContext.Provider>
    </QueryClientProvider>
  );

  const CAD_CLASSIC_IDS = { modelId: 123, revisionId: 234 };
  const POINT_CLOUD_CLASSIC_IDS = { modelId: 987, revisionId: 876 };

  test('returns all visible classic objects from useVisibleRevealDomainObjects', async () => {
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    mockUseVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_IDS)),
      new PointCloudDomainObject(createPointCloudMock(POINT_CLOUD_CLASSIC_IDS)),
      image360DomainObject
    ]);

    const { result } = renderHook(() => useActiveReveal3dResources({}), { wrapper });

    await waitFor(() => {
      expect(result.current.models.length + result.current.image360Collections.length).toBe(3);
    });

    expect(result.current.models[0]).toEqual(CAD_CLASSIC_IDS);
    expect(result.current.models[1]).toEqual(POINT_CLOUD_CLASSIC_IDS);
    expect(result.current.image360Collections[0]).toBe(image360DomainObject.model);
  });

  test('returns modelId/revisionId from FdmSDK for DM point cloud', async () => {
    const pointCloudModelExternalId = createPointCloudModelExternalId(
      POINT_CLOUD_CLASSIC_IDS.modelId
    );
    const pointCloudRevisionExternalId = createPointCloudRevisionExternalId(
      POINT_CLOUD_CLASSIC_IDS.revisionId
    );

    mockUseVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_IDS)),
      new PointCloudDomainObject(
        createPointCloudDMMock({ revisionExternalId: pointCloudRevisionExternalId })
      )
    ]);

    mockQueryNodesAndEdges.mockReturnValue(
      Promise.resolve(createQueryResponseWithModelExternalId(pointCloudModelExternalId))
    );

    const { result } = renderHook(() => useActiveReveal3dResources({}), { wrapper });

    await waitFor(() => {
      expect(result.current.models.length + result.current.image360Collections.length).toBe(2);
    });

    expect(result.current.models[0]).toEqual(CAD_CLASSIC_IDS);
    expect(result.current.models[1]).toEqual(POINT_CLOUD_CLASSIC_IDS);
  });

  test('returned value is stable over rerenders', async () => {
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    mockUseVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_IDS)),
      new PointCloudDomainObject(createPointCloudMock(POINT_CLOUD_CLASSIC_IDS)),
      image360DomainObject
    ]);

    const layerState = {};

    const { result, rerender } = renderHook(() => useActiveReveal3dResources(layerState), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.models.length + result.current.image360Collections.length).toBe(3);
    });

    const initialValue = result.current;
    rerender();
    expect(result.current).toBe(initialValue);
  });
});

function createQueryResponseWithModelExternalId(modelExternalId: string): QueryResult<any, any> {
  return {
    items: {
      revision: [
        createDmsNodeItem({
          properties: {
            cdf_cdm: {
              'Cognite3DRevision/v1': { model3D: { externalId: modelExternalId } }
            }
          }
        })
      ]
    },
    nextCursor: {}
  };
}
