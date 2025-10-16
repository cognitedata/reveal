import { beforeEach, describe, expect, test } from 'vitest';
import { updateViewerFromExternalState } from './updateViewerFromExternalState';
import { viewerImage360CollectionsMock, viewerModelsMock } from '#test-utils/fixtures/viewer';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { type ModelLayerContent } from './types';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject,
  type RevealRenderTarget
} from '../../../architecture';

describe(updateViewerFromExternalState.name, () => {
  let modelStates: ModelLayerContent;
  let renderTargetMock: RevealRenderTarget;

  beforeEach(() => {
    modelStates = {
      cadModels: [new CadDomainObject(createCadMock())],
      pointClouds: [new PointCloudDomainObject(createPointCloudMock())],
      image360Collections: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    };
    renderTargetMock = createRenderTargetMock();
  });

  test('updates viewer with external layers state', () => {
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 654, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'siteId', applied: true, index: 0 }]
    };

    const modelLayerState: ModelLayerContent = {
      cadModels: [new CadDomainObject(createCadMock())],
      pointClouds: [new PointCloudDomainObject(createPointCloudMock())],
      image360Collections: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    };

    updateViewerFromExternalState(layersState, modelLayerState, renderTargetMock);

    expect(modelLayerState.cadModels[0].isVisible(renderTargetMock)).toBe(true);
    expect(modelLayerState.pointClouds[0].isVisible(renderTargetMock)).toBe(true);
    expect(modelLayerState.image360Collections[0].isVisible(renderTargetMock)).toBe(true);
  });

  test('updates viewer with mixed visibility state', () => {
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 654, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'siteId', applied: false, index: 0 }]
    };

    const modelLayerState: ModelLayerContent = {
      cadModels: [new CadDomainObject(createCadMock())],
      pointClouds: [new PointCloudDomainObject(createPointCloudMock())],
      image360Collections: [new Image360CollectionDomainObject(createImage360ClassicMock())]
    };

    updateViewerFromExternalState(layersState, modelLayerState, renderTargetMock);

    expect(modelLayerState.cadModels[0].isVisible(renderTargetMock)).toBe(false);
    expect(modelLayerState.pointClouds[0].isVisible(renderTargetMock)).toBe(true);
    expect(modelLayerState.image360Collections[0].isVisible(renderTargetMock));
  });

  test('does nothing if layersState is undefined', () => {
    updateViewerFromExternalState(undefined, modelStates, renderTargetMock);

    expect(modelStates.cadModels[0].isVisible(renderTargetMock)).toBe(false);
    expect(modelStates.pointClouds[0].isVisible(renderTargetMock)).toBe(false);
    expect(modelStates.image360Collections[0].isVisible(renderTargetMock)).toBe(false);
  });

  test('updates viewer with empty layers state without problems', () => {
    const layersState = {
      cadLayers: [],
      pointCloudLayers: [],
      image360Layers: []
    };

    viewerModelsMock.mockReturnValue([]);
    viewerImage360CollectionsMock.mockReturnValue([]);

    modelStates = { cadModels: [], pointClouds: [], image360Collections: [] };

    expect(() => {
      updateViewerFromExternalState(layersState, modelStates, renderTargetMock);
    }).not.toThrow();
  });
});
