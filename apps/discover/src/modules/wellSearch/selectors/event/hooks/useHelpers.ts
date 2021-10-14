import { CogniteEvent } from '@cognite/sdk';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';
import { getNdsUnitChangeAccessors } from 'modules/wellSearch/selectors/event/helper';
import { EventsType } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';

import { ndsAccessorsToFixedDecimal } from '../constants';

export const useNdsUserPrefferedUnitChangeAcceessors = () =>
  getNdsUnitChangeAccessors(useUserPreferencesMeasurement());

export const useGetConverFunctionForEvents = () => {
  return (eventType: EventsType, errorHandler?: (error: string) => void) => {
    switch (eventType) {
      case 'nds': {
        const ndsUnitChangeAcceessors = getNdsUnitChangeAccessors(
          useUserPreferencesMeasurement()
        );
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
      }
      default:
        return (event: CogniteEvent) => event;
    }
  };
};
