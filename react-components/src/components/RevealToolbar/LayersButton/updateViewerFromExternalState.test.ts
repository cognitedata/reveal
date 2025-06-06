import { describe, expect, test, vi, beforeEach } from 'vitest';
import { updateViewerFromExternalState } from './updateViewerFromExternalState';
import {
  viewerImage360CollectionsMock,
  viewerMock,
  viewerModelsMock
} from '#test-utils/fixtures/viewer';
import { type CogniteModel } from '@cognite/reveal';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';

describe(updateViewerFromExternalState.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('updates viewer with external layers state', () => {
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 654, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'siteId', applied: true, index: 0 }]
    };
    const mockModels: CogniteModel[] = [cadMock, createPointCloudMock()];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    updateViewerFromExternalState(layersState, viewerMock);

    expect(viewerMock.models[0].visible).toBe(true);
    expect(viewerMock.models[1].visible).toBe(true);
    expect(viewerMock.get360ImageCollections()[0].setIconsVisibility).toHaveBeenCalledWith(true);
  });

  test('updates viewer with mixed visibility state', () => {
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 654, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'siteId', applied: false, index: 0 }]
    };
    const mockModels: CogniteModel[] = [cadMock, createPointCloudMock()];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    updateViewerFromExternalState(layersState, viewerMock);
    cadMock.visible = layersState.cadLayers[0].applied;
    mockImage360Collection.setIconsVisibility(layersState.image360Layers[0].applied);

    expect(viewerMock.models[0].visible).toBe(false);
    expect(viewerMock.models[1].visible).toBe(true);
    expect(viewerMock.get360ImageCollections()[0].setIconsVisibility).toHaveBeenCalledWith(false);
  });

  test('does nothing if layersState is undefined', () => {
    const mockModels: CogniteModel[] = [cadMock, createPointCloudMock()];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);
    updateViewerFromExternalState(undefined, viewerMock);

    expect(viewerMock.get360ImageCollections()[0].setIconsVisibility).not.toHaveBeenCalled();
  });

  test('updates viewer with empty layers state', () => {
    const layersState = {
      cadLayers: [],
      pointCloudLayers: [],
      image360Layers: []
    };

    viewerModelsMock.mockReturnValue([]);
    viewerImage360CollectionsMock.mockReturnValue([]);

    updateViewerFromExternalState(layersState, viewerMock);

    expect(viewerMock.models).toHaveLength(0);
    expect(viewerMock.get360ImageCollections()).toHaveLength(0);
  });
});
