import { IRiskEvent } from '@cognite/node-visualizer';
import { CogniteEvent } from '@cognite/sdk';

export const mapNDSTo3D = (
  eventsMap: CogniteEvent[]
): Partial<IRiskEvent>[] => {
  return eventsMap.map((event) => {
    return {
      ...event,
      assetIds: (event.assetIds || []).map(String),
    };
  });
};
