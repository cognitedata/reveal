import { CogniteClient } from '@cognite/sdk';
import { v4 as uuid } from 'uuid';
import {
  EventContainerReference,
  IndustryCanvasContainerConfig,
} from '../../types';
import {
  DEFAULT_EVENT_HEIGHT,
  DEFAULT_EVENT_WIDTH,
} from '../../utils/addDimensionsToContainerReference';
import getEventTableContainerConfig, {
  getEventTableTitle,
} from './getEventTableContainerConfig';

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
    ...(await getEventTableContainerConfig(
      sdk as any,
      {
        id: id || uuid(),
        label: label ?? eventTitle,
        x: x,
        y: y,
        width: width ?? DEFAULT_EVENT_WIDTH,
        height: height ?? DEFAULT_EVENT_HEIGHT,
      },
      {
        eventId: resourceId,
      }
    )),
    metadata: {
      resourceId,
      resourceType: 'event',
      name: eventTitle,
      externalId: event.externalId,
    },
  } as IndustryCanvasContainerConfig;
};

export default resolveEventContainerConfig;
