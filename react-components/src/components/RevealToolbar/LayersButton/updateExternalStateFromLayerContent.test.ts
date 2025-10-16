import { describe, expect, test, vi } from 'vitest';
import { updateExternalStateFromLayerContent } from './updateExternalStateFromLayerContent';
import { type LayersUrlStateParam } from './types';
import { type Dispatch, type SetStateAction } from 'react';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject
} from '../../../architecture';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import assert from 'assert';

describe(updateExternalStateFromLayerContent.name, () => {
  test('outputs correct state for all layers', () => {
    const setLayerStateMock = vi.fn<Dispatch<SetStateAction<LayersUrlStateParam | undefined>>>();

    const cadDomainObject0 = new CadDomainObject(createCadMock({ revisionId: 123 }));
    const cadDomainObject1 = new CadDomainObject(
      createCadMock({ revisionId: 234, visible: false })
    );

    const pointCloudDomainObject0 = new PointCloudDomainObject(
      createPointCloudMock({ revisionId: 345 })
    );
    const pointCloudDomainObject1 = new PointCloudDomainObject(
      createPointCloudMock({ revisionId: 456, visible: false })
    );

    const image360CollectionDomainObject0 = new Image360CollectionDomainObject(
      createImage360ClassicMock()
    );

    const image360CollectionDomainObject1 = new Image360CollectionDomainObject(
      createImage360ClassicMock({ visible: false })
    );

    const renderTargetMock = createRenderTargetMock();

    updateExternalStateFromLayerContent(
      {
        cadModels: [cadDomainObject0, cadDomainObject1],
        pointClouds: [pointCloudDomainObject0, pointCloudDomainObject1],
        image360Collections: [image360CollectionDomainObject0, image360CollectionDomainObject1]
      },
      setLayerStateMock,
      renderTargetMock
    );

    expect(setLayerStateMock).toHaveBeenCalledOnce();

    const result = setLayerStateMock.mock.calls[0][0];

    assert(result !== undefined);
    assert(typeof result !== 'function');

    assert(result.cadLayers !== undefined);
    assert(result.pointCloudLayers !== undefined);
    assert(result.image360Layers !== undefined);

    expect(result.cadLayers).toHaveLength(2);

    expect(result.cadLayers[0].applied).toBe(cadDomainObject0.isVisible(renderTargetMock));
    expect(result.cadLayers[0].revisionId).toBe(cadDomainObject0.model.revisionId);
    expect(result.cadLayers[0].index).toBe(0);

    expect(result.cadLayers[1].applied).toBe(cadDomainObject1.isVisible(renderTargetMock));
    expect(result.cadLayers[1].revisionId).toBe(cadDomainObject1.model.revisionId);
    expect(result.cadLayers[1].index).toBe(1);

    expect(result.pointCloudLayers).toHaveLength(2);

    expect(result.pointCloudLayers[0].applied).toBe(
      pointCloudDomainObject0.isVisible(renderTargetMock)
    );
    expect(result.pointCloudLayers[0].revisionId).toBe(pointCloudDomainObject0.model.revisionId);
    expect(result.pointCloudLayers[0].index).toBe(0);

    expect(result.pointCloudLayers[1].applied).toBe(
      pointCloudDomainObject1.isVisible(renderTargetMock)
    );
    expect(result.pointCloudLayers[1].revisionId).toBe(pointCloudDomainObject1.model.revisionId);
    expect(result.pointCloudLayers[1].index).toBe(1);

    expect(result.image360Layers).toHaveLength(2);

    expect(result.image360Layers[0].applied).toBe(
      image360CollectionDomainObject0.isVisible(renderTargetMock)
    );
    expect(result.image360Layers[0].siteId).toBe(image360CollectionDomainObject0.model.id);

    expect(result.image360Layers[1].applied).toBe(
      image360CollectionDomainObject1.isVisible(renderTargetMock)
    );
    expect(result.image360Layers[1].siteId).toBe(image360CollectionDomainObject1.model.id);
  });
});
