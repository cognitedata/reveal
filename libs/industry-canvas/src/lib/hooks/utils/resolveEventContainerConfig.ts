import { CogniteClient } from '@cognite/sdk';
import getEventTableContainerConfig, {
  getEventTableTitle,
} from './getEventTableContainerConfig';
import { IndustryCanvasContainerConfig } from '../../types';
import {
  DEFAULT_EVENT_HEIGHT,
  DEFAULT_EVENT_WIDTH,
} from '../../utils/addDimensionsToContainerReference';
import { v4 as uuid } from 'uuid';

const resolveEventContainerConfig = async (
  sdk: CogniteClient,
  {
    id,
    resourceId,
    x,
    y,
    width,
    height,
    label,
  }: {
    id?: string | undefined;
    resourceId: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label?: string;
  }
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
