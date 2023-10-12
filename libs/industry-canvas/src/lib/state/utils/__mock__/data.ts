import { ContainerType } from '@cognite/unified-file-viewer';

import { IndustryCanvasContainerConfig } from '../../../types';

export const EventContainerConfigTypeAB1: IndustryCanvasContainerConfig = {
  id: 'event-container-id-ab1',
  type: ContainerType.EVENT,
  width: 100,
  height: 100,
  eventId: 12345,
  metadata: {
    eventType: 'a',
    eventSubType: 'b',
  },
};

export const EventContainerConfigTypeBB1: IndustryCanvasContainerConfig = {
  id: 'event-container-id-bb1',
  type: ContainerType.EVENT,
  width: 100,
  height: 100,
  eventId: 12345,
  metadata: {
    eventType: 'b',
    eventSubType: 'b',
  },
};

export const EventContainerConfigTypeCUndefinedSubType: IndustryCanvasContainerConfig =
  {
    id: 'event-container-id-bb1',
    type: ContainerType.EVENT,
    width: 100,
    height: 100,
    eventId: 12345,
    metadata: {
      eventType: 'b',
      eventSubType: undefined,
    },
  };

export const AssetContainerConfig: IndustryCanvasContainerConfig = {
  id: 'asset-container-id',
  type: ContainerType.ASSET,
  width: 100,
  height: 100,
  assetId: 56789,
  metadata: {},
};

export const AssetContainerConfig2: IndustryCanvasContainerConfig = {
  id: 'asset-container-id2',
  type: ContainerType.ASSET,
  width: 100,
  height: 100,
  assetId: 56789,
  metadata: {},
};
