import get from 'lodash/get';

import { CogniteEventV3ish } from 'modules/wellSearch/types';

export const isEventsOverlap = (
  parentEvent: CogniteEventV3ish,
  childEvent: CogniteEventV3ish
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
