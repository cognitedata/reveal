import { INds } from '@cognite/node-visualizer';
import { CogniteEvent } from '@cognite/sdk';

export const mapNDSTo3D = (eventsMap: CogniteEvent[]): Partial<INds>[] => {
  return eventsMap.map((event) => {
    return {
      ...event,
      assetIds: (event.assetIds || []).map(String),
    };
  });
};
