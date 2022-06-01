import compact from 'lodash/compact';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { ndsAccessorsToFixedDecimal } from 'modules/wellSearch/selectors/event/constants';
import { getNdsUnitChangeAccessors } from 'modules/wellSearch/selectors/event/helper';
import { CogniteEventV3ish } from 'modules/wellSearch/types';
import { convertObject } from 'modules/wellSearch/utils';

import { EventData } from '../LogViewer/Log/interfaces';
import { isEventsOverlap } from '../LogViewer/utils';

export const useEventsData = (events: CogniteEventV3ish[]): EventData[] => {
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

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

      return {
        holeStartValue: Number(get(convertedEvent, 'metadata.md_hole_start')),
        holeEndValue: Number(get(convertedEvent, 'metadata.md_hole_start')),
        riskType: get(convertedEvent, 'metadata.name'),
      };
    });
  }, [events, userPreferredUnit]);
};
