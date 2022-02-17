import compact from 'lodash/compact';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

import { CogniteEvent } from '@cognite/sdk';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { ndsAccessorsToFixedDecimal } from 'modules/wellSearch/selectors/event/constants';
import { getNdsUnitChangeAccessors } from 'modules/wellSearch/selectors/event/helper';
import { convertObject } from 'modules/wellSearch/utils';

import { isEventsOverlap } from '../LogViewer/utils';

export const useEventsData = (events: CogniteEvent[]) => {
  const userPreferredUnit = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    const nonOverlappingEvents = events.filter((parentEvent) => {
      const overlappingStatus = events.map((childEvent) =>
        isEventsOverlap(parentEvent, childEvent)
      );
      return isEmpty(compact(overlappingStatus));
    });

    return sortBy(nonOverlappingEvents, (event) =>
      Number(get(event, 'metadata.md_hole_start'))
    ).map((event) => {
      const convertedEvent = convertObject(event)
        .changeUnits(getNdsUnitChangeAccessors(userPreferredUnit))
        .toClosestInteger(ndsAccessorsToFixedDecimal)
        .get();

      return [
        Number(get(convertedEvent, 'metadata.md_hole_start')),
        get(convertedEvent, 'metadata.name'),
        Number(get(convertedEvent, 'metadata.md_hole_end')),
        null,
      ];
    });
  }, [events, userPreferredUnit]);
};
