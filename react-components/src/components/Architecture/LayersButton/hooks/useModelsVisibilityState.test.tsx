import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useModelsVisibilityState } from './useModelsVisibilityState';
import { renderHook } from '@testing-library/react';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { type LayersUrlStateParam } from '../types';
import {
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  type ReactElement
} from 'react';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  type RevealRenderTarget
} from '../../../../architecture';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUseModelsVisibilityStateDependencies,
  UseModelsVisibilityStateContext
} from './useModelsVisibilityState.context';

describe(useModelsVisibilityState.name, () => {
  let cadObject: CadDomainObject;
  let pointCloudObject: PointCloudDomainObject;
  let image360CollectionObject: Image360CollectionDomainObject;

  let renderTarget: RevealRenderTarget;

  const dependencies = getMocksByDefaultDependencies(defaultUseModelsVisibilityStateDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <UseModelsVisibilityStateContext.Provider value={dependencies}>
      {children}
    </UseModelsVisibilityStateContext.Provider>
  );

  beforeEach(() => {
    cadObject = new CadDomainObject(createCadMock());
    pointCloudObject = new PointCloudDomainObject(createPointCloudMock());
    image360CollectionObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    pointCloudObject.setVisibleInteractive(false);

    renderTarget = createRenderTargetMock();
    renderTarget.root.addChildInteractive(cadObject);
    renderTarget.root.addChildInteractive(pointCloudObject);
    renderTarget.root.addChildInteractive(image360CollectionObject);

    dependencies.useRevealDomainObjects.mockReturnValue([
      cadObject,
      pointCloudObject,
      image360CollectionObject
    ]);

    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      cadObject,
      image360CollectionObject
    ]);
  });

  test('returns models', () => {
    const { result } = renderHook(() => useModelsVisibilityState(undefined, renderTarget), {
      wrapper
    });

    expect(result.current.cadModels).toEqual([cadObject]);
    expect(result.current.pointClouds).toEqual([pointCloudObject]);
    expect(result.current.image360Collections).toEqual([image360CollectionObject]);
  });

  test('calling update updates external layer state', () => {
    const setExternalState = vi.fn<Dispatch<SetStateAction<LayersUrlStateParam | undefined>>>();

    renderHook(() => useModelsVisibilityState(setExternalState, renderTarget), {
      wrapper
    });

    expect(setExternalState).toHaveBeenCalledOnce();
    const returnedObject = setExternalState.mock.calls[0][0] as LayersUrlStateParam;

    expect(returnedObject).toBeDefined();

    expect(returnedObject?.cadLayers).toHaveLength(1);
    expect(returnedObject?.pointCloudLayers).toHaveLength(1);
    expect(returnedObject?.image360Layers).toHaveLength(1);

    expect(returnedObject?.cadLayers?.[0].applied).toBe(cadObject.isVisible(renderTarget));

    expect(returnedObject?.pointCloudLayers?.[0].applied).toBe(
      pointCloudObject.isVisible(renderTarget)
    );

    expect(returnedObject?.image360Layers?.[0].applied).toBe(
      image360CollectionObject.isVisible(renderTarget)
    );
  });
});
