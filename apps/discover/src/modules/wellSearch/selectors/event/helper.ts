import { CogniteEvent } from '@cognite/sdk';

import { EventsType } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';

import {
  ndsUnitChangeAcceessors,
  ndsAccessorsToFixedDecimal,
} from './constants';
// add any convert function here if there is new events or table changes
export const getConverFunctionForEvents = (
  eventType: EventsType,
  errorHandler?: (error: string) => void
) => {
  switch (eventType) {
    case 'nds':
      if (errorHandler) {
        if (ndsUnitChangeAcceessors.length)
          ndsUnitChangeAcceessors[0].errorHandler = errorHandler;
        if (ndsUnitChangeAcceessors.length > 1)
          ndsUnitChangeAcceessors[1].errorHandler = errorHandler;
      }
      return (event: CogniteEvent) =>
        convertObject(event)
          .changeUnits(ndsUnitChangeAcceessors)
          .toClosestInteger(ndsAccessorsToFixedDecimal)
          .get();
    default:
      return (event: CogniteEvent) => event;
  }
};
