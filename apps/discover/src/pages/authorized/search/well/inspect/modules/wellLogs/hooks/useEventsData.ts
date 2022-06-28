import { sortNdsByHoleStart } from 'domain/wells/nds/internal/transformers/sortNdsByHoleStart';
import { NdsInternal } from 'domain/wells/nds/internal/types';

import { useMemo } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { EventData } from '../LogViewer/Log/interfaces';
import { isEventsOverlap } from '../LogViewer/utils';

export const useEventsData = (events: NdsInternal[]): EventData[] => {
  return useMemo(() => {
    const nonOverlappingEvents = events.filter((parentEvent) => {
      const overlappingStatus = events.map((childEvent) =>
        isEventsOverlap(parentEvent, childEvent)
      );
      return isEmpty(compact(overlappingStatus));
    });

    return sortNdsByHoleStart(nonOverlappingEvents).map(
      ({ holeStart, holeEnd, riskType }) => {
        return {
          holeStartValue: Number(holeStart?.value),
          holeEndValue: Number(holeEnd?.value),
          riskType,
        };
      }
    );
  }, [events]);
};
