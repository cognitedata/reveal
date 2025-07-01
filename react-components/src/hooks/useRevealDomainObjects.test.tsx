import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  useRevealDomainObjects,
  UseRevealDomainObjectsContext,
  type UseRevealDomainObjectsDependencies
} from './useRevealDomainObjects';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { useRenderTarget } from '../components';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { Changes, DomainObject, RevealRenderTarget } from '../architecture';
import { createViewerMock, viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';

describe(useRevealDomainObjects.name, () => {
  const mockUseRenderTarget = vi.fn<UseRevealDomainObjectsDependencies['useRenderTarget']>();

  const wrapper = ({ children }: PropsWithChildren) => (
    <UseRevealDomainObjectsContext.Provider value={{ useRenderTarget: mockUseRenderTarget }}>
      {children}
    </UseRevealDomainObjectsContext.Provider>
  );

  let revealRenderTarget: RevealRenderTarget;

  beforeEach(() => {
    vi.resetAllMocks();
    revealRenderTarget = new RevealRenderTarget(createViewerMock(), sdkMock);
    mockUseRenderTarget.mockReturnValue(revealRenderTarget);
  });

  test('returns nothing when no Reveal domain objects exist', () => {
    const { result } = renderHook(() => useRevealDomainObjects(), { wrapper });

    expect(result.current).toEqual([]);
  });

  test('returns all domain objects in render target', () => {
    const dummyDomainObject = new DummyDomainObject();
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    revealRenderTarget.rootDomainObject.addChild(dummyDomainObject);
    dummyDomainObject.addChild(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChild(pointCloudDomainObject);
    revealRenderTarget.rootDomainObject.addChild(image360DomainObject);

    const { result } = renderHook(() => useRevealDomainObjects(), { wrapper });

    expect(result.current).toHaveLength(3);
    expect(result.current[0]).toBe(cadDomainObject);
    expect(result.current[1]).toBe(pointCloudDomainObject);
    expect(result.current[2]).toBe(image360DomainObject);
  });

  test('holds stable reference over rerenders', () => {
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());
    revealRenderTarget.rootDomainObject.addChild(pointCloudDomainObject);
    const { result, rerender } = renderHook(() => useRevealDomainObjects(), { wrapper });

    const initialResult = result.current;
    expect(initialResult).toHaveLength(1);
    expect(initialResult[0]).toBe(pointCloudDomainObject);

    rerender();

    expect(result.current).toBe(initialResult);
  });

  test('updates returned reference when a Reveal object is added to render target', async () => {
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());

    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);

    const { result } = renderHook(() => useRevealDomainObjects(), { wrapper });

    const initialResult = result.current;

    act(() => {
      revealRenderTarget.rootDomainObject.addChildInteractive(pointCloudDomainObject);
    });

    const secondResult = result.current;

    await waitFor(() => {
      expect(result.current).not.toBe(initialResult);
    });

    expect(secondResult).toHaveLength(2);
    expect(secondResult[0]).toBe(cadDomainObject);
    expect(secondResult[1]).toBe(pointCloudDomainObject);
  });

  test('updates returned reference  when a Reveal object is removed from render target', () => {
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());

    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChild(pointCloudDomainObject);

    const { result } = renderHook(() => useRevealDomainObjects(), { wrapper });

    const initialResult = result.current;

    expect(initialResult).toHaveLength(2);

    act(() => {
      cadDomainObject.removeInteractive();
    });

    const secondResult = result.current;

    expect(secondResult).not.toBe(initialResult);

    expect(secondResult).toHaveLength(1);
    expect(secondResult[0]).toBe(pointCloudDomainObject);
  });

  test('updates returned objects filtered by predicate when a user-specified change happens', () => {
    const cadDomainObject = new CadDomainObject(createCadMock());
    const dummyDomainObject = new DummyDomainObject();
    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChild(dummyDomainObject);

    cadDomainObject.setVisibleInteractive(true, revealRenderTarget);

    const { result } = renderHook(
      () =>
        useRevealDomainObjects(
          (domainObject) => domainObject.isVisible(revealRenderTarget),
          [Changes.visibleState]
        ),
      {
        wrapper
      }
    );

    const initialResult = result.current;

    expect(initialResult).toHaveLength(1);

    act(() => {
      cadDomainObject.setVisibleInteractive(false, revealRenderTarget);
    });

    const secondResult = result.current;

    expect(secondResult).not.toBe(initialResult);
    expect(secondResult).toEqual([]);
  });
});

class DummyDomainObject extends DomainObject {
  typeName = { untranslated: 'DummyDomainObject' };
}
