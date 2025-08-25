import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  defaultUseActiveReveal3dResourcesDependencies,
  useActiveReveal3dResources,
  UseActiveReveal3dResourcesContext
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
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(useActiveReveal3dResources.name, () => {
  const queryClient = new QueryClient();

  const mockQueryNodesAndEdges = vi.fn<() => Promise<QueryResult<any, any>>>();

  const mockFdmSdk = new Mock<FdmSDK>()
    .setup((p) => p.queryNodesAndEdges)
    .returns(mockQueryNodesAndEdges)
    .object();

  const dependencies = getMocksByDefaultDependencies(defaultUseActiveReveal3dResourcesDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UseActiveReveal3dResourcesContext.Provider value={dependencies}>
        {children}
      </UseActiveReveal3dResourcesContext.Provider>
    </QueryClientProvider>
  );

  const CAD_CLASSIC_ID = { modelId: 123, revisionId: 234 };
  const POINT_CLOUD_CLASSIC_ID = { modelId: 987, revisionId: 876 };
  const pointCloudModelExternalId = createPointCloudModelExternalId(POINT_CLOUD_CLASSIC_ID.modelId);
  const pointCloudRevisionExternalId = createPointCloudRevisionExternalId(
    POINT_CLOUD_CLASSIC_ID.revisionId
  );

  beforeEach(() => {
    dependencies.useFdmSdk.mockReturnValue(mockFdmSdk);
  });

  test('returns all visible classic objects from useVisibleRevealDomainObjects', async () => {
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_ID)),
      new PointCloudDomainObject(createPointCloudMock(POINT_CLOUD_CLASSIC_ID)),
      image360DomainObject
    ]);

    const { result } = renderHook(() => useActiveReveal3dResources({}), { wrapper });

    await waitFor(() => {
      expect(result.current.models.length + result.current.image360Collections.length).toBe(3);
    });

    expect(result.current.models[0]).toEqual(CAD_CLASSIC_ID);
    expect(result.current.models[1]).toEqual(POINT_CLOUD_CLASSIC_ID);
    expect(result.current.image360Collections[0]).toBe(image360DomainObject.model);
  });

  test('returns modelId/revisionId from FdmSDK for DM point cloud', async () => {
    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_ID)),
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

    expect(result.current.models[0]).toEqual(CAD_CLASSIC_ID);
    expect(result.current.models[1]).toEqual(POINT_CLOUD_CLASSIC_ID);
  });

  test('returns remaining models if not all model identifiers could be found', async () => {
    const secondPointCloudId = { modelId: 1234, revisionId: 2345 };
    const secondPointCloudModelExternalId = createPointCloudModelExternalId(
      secondPointCloudId.modelId
    );
    const secondPointCloudRevisionExternalId = createPointCloudRevisionExternalId(
      secondPointCloudId.revisionId
    );
    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_ID)),
      new PointCloudDomainObject(
        createPointCloudDMMock({ revisionExternalId: pointCloudRevisionExternalId })
      ),
      new PointCloudDomainObject(
        createPointCloudDMMock({ revisionExternalId: secondPointCloudRevisionExternalId })
      )
    ]);

    mockQueryNodesAndEdges
      .mockReturnValueOnce(Promise.reject(new Error('Error')))
      .mockReturnValue(
        Promise.resolve(createQueryResponseWithModelExternalId(secondPointCloudModelExternalId))
      );

    const { result } = renderHook(() => useActiveReveal3dResources({}), { wrapper });

    await waitFor(() => {
      expect(result.current.models.length + result.current.image360Collections.length).toBe(2);
    });

    expect(result.current.models[0]).toEqual(CAD_CLASSIC_ID);
    expect(result.current.models[1]).toEqual(secondPointCloudId);
  });

  test('returned value is stable over rerenders', async () => {
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      new CadDomainObject(createCadMock(CAD_CLASSIC_ID)),
      new PointCloudDomainObject(createPointCloudMock(POINT_CLOUD_CLASSIC_ID)),
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
