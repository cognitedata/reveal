import { beforeEach, describe, expect, test } from 'vitest';
import { updateViewerFromExternalState } from './updateViewerFromExternalState';
import { viewerImage360CollectionsMock, viewerModelsMock } from '#test-utils/fixtures/viewer';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { ModelLayerHandlers } from './types';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  RevealRenderTarget
} from '../../../architecture';

describe(updateViewerFromExternalState.name, () => {
  let modelStates: ModelLayerHandlers;
  let renderTargetMock: RevealRenderTarget;

  beforeEach(() => {
    modelStates = {
      cadHandlers: [new CadDomainObject(createCadMock())],
      pointCloudHandlers: [new PointCloudDomainObject(createPointCloudMock())],
      image360Handlers: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    };
    renderTargetMock = createRenderTargetMock();
  });

  test('updates viewer with external layers state', () => {
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 654, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'siteId', applied: true, index: 0 }]
    };

    const modelLayerState: ModelLayerHandlers = {
      cadHandlers: [new CadDomainObject(createCadMock())],
      pointCloudHandlers: [new PointCloudDomainObject(createPointCloudMock())],
      image360Handlers: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    };

    updateViewerFromExternalState(layersState, modelLayerState, renderTargetMock);

    expect(modelLayerState.cadHandlers[0].isVisible(renderTargetMock)).toBe(true);
    expect(modelLayerState.pointCloudHandlers[0].isVisible(renderTargetMock)).toBe(true);
    expect(modelLayerState.image360Handlers[0].isVisible(renderTargetMock)).toBe(true);
  });

  test('updates viewer with mixed visibility state', () => {
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 654, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'siteId', applied: false, index: 0 }]
    };

    const modelLayerState: ModelLayerHandlers = {
      cadHandlers: [new CadDomainObject(createCadMock())],
      pointCloudHandlers: [new PointCloudDomainObject(createPointCloudMock())],
      image360Handlers: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    };

    updateViewerFromExternalState(layersState, modelLayerState, renderTargetMock);

    expect(modelLayerState.cadHandlers[0].isVisible(renderTargetMock)).toBe(false);
    expect(modelLayerState.pointCloudHandlers[0].isVisible(renderTargetMock)).toBe(true);
    expect(modelLayerState.image360Handlers[0].isVisible(renderTargetMock));
  });

  test('does nothing if layersState is undefined', () => {
    updateViewerFromExternalState(undefined, modelStates, renderTargetMock);

    expect(modelStates.cadHandlers[0].isVisible(renderTargetMock)).toBe(false);
    expect(modelStates.pointCloudHandlers[0].isVisible(renderTargetMock)).toBe(false);
    expect(modelStates.image360Handlers[0].isVisible(renderTargetMock)).toBe(false);
  });

  test('updates viewer with empty layers state without problems', () => {
    const layersState = {
      cadLayers: [],
      pointCloudLayers: [],
      image360Layers: []
    };

    viewerModelsMock.mockReturnValue([]);
    viewerImage360CollectionsMock.mockReturnValue([]);

    modelStates = { cadHandlers: [], pointCloudHandlers: [], image360Handlers: [] };

    expect(() =>
      updateViewerFromExternalState(layersState, modelStates, renderTargetMock)
    ).not.toThrow();
  });
});
