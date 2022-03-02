import get from 'lodash/get';

import { CogniteEvent } from '@cognite/sdk';

export const isEventsOverlap = (
  parentEvent: CogniteEvent,
  childEvent: CogniteEvent
) => {
  return (
    parentEvent.id !== childEvent.id &&
    get(parentEvent, 'metadata.name') === get(childEvent, 'metadata.name') &&
    Number(get(parentEvent, 'metadata.md_hole_start')) >=
      Number(get(childEvent, 'metadata.md_hole_start')) &&
    Number(get(parentEvent, 'metadata.md_hole_end')) <=
      Number(get(childEvent, 'metadata.md_hole_end'))
  );
};
