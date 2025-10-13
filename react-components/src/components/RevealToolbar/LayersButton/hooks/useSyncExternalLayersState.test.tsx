import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';
import { renderHook } from '@testing-library/react';
import { wrapper } from '#test-components/fixtures/wrapper';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { CadDomainObject, RevealRenderTarget } from '../../../../architecture';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { LayersUrlStateParam, ModelLayerHandlers } from '../types';

describe(useSyncExternalLayersState.name, () => {
  const CAD_REVISION_ID = 123;

  let renderTarget: RevealRenderTarget;
  let cadObject: CadDomainObject;

  beforeEach(() => {
    renderTarget = createRenderTargetMock();
    cadObject = new CadDomainObject(createCadMock({ revisionId: CAD_REVISION_ID }));
  });

  test('syncs external state into domain objects', () => {
    const modelLayerHandlers = {
      cadHandlers: [cadObject],
      pointCloudHandlers: [],
      image360Handlers: []
    };
    const externalLayersState: LayersUrlStateParam = {
      cadLayers: [{ revisionId: CAD_REVISION_ID, applied: true, index: 0 }]
    };

    expect(cadObject.isVisible(renderTarget)).toBe(false);

    renderHook(
      () => {
        useSyncExternalLayersState(modelLayerHandlers, externalLayersState, vi.fn(), renderTarget);
      },
      { wrapper }
    );

    expect(cadObject.isVisible(renderTarget)).toBe(true);
  });

  test('syncs domain object state into external state if changed between rerenders', () => {
    const modelLayerHandlers = {
      cadHandlers: [cadObject],
      pointCloudHandlers: [],
      image360Handlers: []
    };
    const externalLayersState: LayersUrlStateParam = {
      cadLayers: [{ revisionId: CAD_REVISION_ID, applied: true, index: 0 }]
    };
    const setExternalLayersState = vi.fn();

    expect(cadObject.isVisible(renderTarget)).toBe(false);

    const { rerender } = renderHook(
      (props: { modelsState: ModelLayerHandlers }) => {
        useSyncExternalLayersState(
          props.modelsState,
          externalLayersState,
          setExternalLayersState,
          renderTarget
        );
      },
      { wrapper, initialProps: { modelsState: modelLayerHandlers } }
    );

    expect(cadObject.isVisible(renderTarget)).toBe(true);
    cadObject.setVisibleInteractive(false, renderTarget);

    rerender({
      modelsState: { cadHandlers: [cadObject], pointCloudHandlers: [], image360Handlers: [] }
    });

    expect(setExternalLayersState).toHaveBeenCalledWith({
      cadLayers: [{ revisionId: CAD_REVISION_ID, applied: false, index: 0 }],
      pointCloudLayers: [],
      image360Layers: []
    });
  });
});
