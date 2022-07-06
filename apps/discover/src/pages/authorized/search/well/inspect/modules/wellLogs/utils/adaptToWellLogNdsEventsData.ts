import { sortNdsByHoleStart } from 'domain/wells/nds/internal/transformers/sortNdsByHoleStart';
import { NdsInternal } from 'domain/wells/nds/internal/types';

import { WellLogNdsEventsData } from '../LogViewer/Log/types';
import { isEventsOverlap } from '../LogViewer/utils';

export const adaptToWellLogNdsEventsData = (
  events: NdsInternal[]
): WellLogNdsEventsData[] => {
  const nonOverlappingEvents = events.filter((parentEvent) => {
    const isOverlap = events.some((childEvent) =>
      isEventsOverlap(parentEvent, childEvent)
    );
    return !isOverlap;
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
};
