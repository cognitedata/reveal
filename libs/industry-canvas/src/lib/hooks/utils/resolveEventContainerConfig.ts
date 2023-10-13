import { v4 as uuid } from 'uuid';

import { CogniteClient, CogniteEvent } from '@cognite/sdk';
import { ContainerType } from '@cognite/unified-file-viewer';

import {
  EventContainerReference,
  IndustryCanvasContainerConfig,
} from '../../types';
import {
  DEFAULT_EVENT_HEIGHT,
  DEFAULT_EVENT_WIDTH,
} from '../../utils/dimensions';

const getEventTableTitle = (event: CogniteEvent): string => {
  let title = '';
  if (event.type) {
    title += event.type;
    if (event.externalId) {
      title += ': ';
    }
  }
  if (event.externalId) {
    title += event.externalId;
  }
  return title;
};

const resolveEventContainerConfig = async (
  sdk: CogniteClient,
  { id, resourceId, x, y, width, height, label }: EventContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  const events = await sdk.events.retrieve([{ id: resourceId }]);

  if (events.length !== 1) {
    throw new Error('Expected to find exactly one asset');
  }

  const event = events[0];
  const eventTitle = getEventTableTitle(event);

  return {
    id: id || uuid(),
    type: ContainerType.EVENT,
    label: label ?? eventTitle,
    x: x,
    y: y,
    width: width ?? DEFAULT_EVENT_WIDTH,
    height: height ?? DEFAULT_EVENT_HEIGHT,
    eventId: resourceId,
    shouldAutoSize: true,
    metadata: {
      resourceId,
      resourceType: 'event',
      name: eventTitle,
      externalId: event.externalId,
      eventType: event.type,
      eventSubType: event.subtype,
    },
  };
};

export default resolveEventContainerConfig;
