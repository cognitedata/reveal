import { describe, expect, test, vi } from 'vitest';
import { updateExternalStateFromLayerHandlers } from './updateExternalStateFromLayerHandlers';
import {
  createCadHandlerMock,
  createImage360HandlerMock,
  createPointCloudHandlerMock
} from '../../../../tests/tests-utilities/fixtures/modelHandler';
import { type LayersUrlStateParam } from './types';
import { type Dispatch, type SetStateAction } from 'react';

describe(updateExternalStateFromLayerHandlers.name, () => {
  test('outputs correct state for all layers', () => {
    const setLayerStateMock = vi.fn<Dispatch<SetStateAction<LayersUrlStateParam | undefined>>>();

    const cadHandlerMock0 = createCadHandlerMock({ revisionId: 123, visible: true });
    const cadHandlerMock1 = createCadHandlerMock({ revisionId: 234, visible: false });

    const pointCloudHandlerMock0 = createPointCloudHandlerMock({ revisionId: 345, visible: false });
    const pointCloudHandlerMock1 = createPointCloudHandlerMock({ revisionId: 456, visible: true });

    const image360HandlerMock0 = createImage360HandlerMock({ siteId: 'site0', visible: true });
    const image360HandlerMock1 = createImage360HandlerMock({ siteId: 'site1', visible: false });

    updateExternalStateFromLayerHandlers(
      {
        cadHandlers: [cadHandlerMock0, cadHandlerMock1],
        pointCloudHandlers: [pointCloudHandlerMock0, pointCloudHandlerMock1],
        image360Handlers: [image360HandlerMock0, image360HandlerMock1]
      },
      setLayerStateMock
    );

    const result = setLayerStateMock.mock.calls[0][0] as LayersUrlStateParam;

    expect(setLayerStateMock).toHaveBeenCalledOnce();

    expect(result.cadLayers).toHaveLength(2);

    expect(result.cadLayers?.[0].applied).toBe(cadHandlerMock0.visible());
    expect(result.cadLayers?.[0].revisionId).toBe(cadHandlerMock0.getRevisionId());
    expect(result.cadLayers?.[0].index).toBe(0);

    expect(result.cadLayers?.[1].applied).toBe(cadHandlerMock1.visible());
    expect(result.cadLayers?.[1].revisionId).toBe(cadHandlerMock1.getRevisionId());
    expect(result.cadLayers?.[1].index).toBe(1);

    expect(result.pointCloudLayers).toHaveLength(2);

    expect(result.pointCloudLayers?.[0].applied).toBe(pointCloudHandlerMock0.visible());
    expect(result.pointCloudLayers?.[0].revisionId).toBe(pointCloudHandlerMock0.getRevisionId());
    expect(result.pointCloudLayers?.[0].index).toBe(0);

    expect(result.pointCloudLayers?.[1].applied).toBe(pointCloudHandlerMock1.visible());
    expect(result.pointCloudLayers?.[1].revisionId).toBe(pointCloudHandlerMock1.getRevisionId());
    expect(result.pointCloudLayers?.[1].index).toBe(1);

    expect(result.image360Layers).toHaveLength(2);

    expect(result.image360Layers?.[0].applied).toBe(image360HandlerMock0.visible());
    expect(result.image360Layers?.[0].siteId).toBe(image360HandlerMock0.getSiteId());

    expect(result.image360Layers?.[1].applied).toBe(image360HandlerMock1.visible());
    expect(result.image360Layers?.[1].siteId).toBe(image360HandlerMock1.getSiteId());
  });
});
