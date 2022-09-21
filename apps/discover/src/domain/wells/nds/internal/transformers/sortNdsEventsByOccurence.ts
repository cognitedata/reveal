import flatten from 'lodash/flatten';

import { NdsInternal } from '../types';

import { groupByRiskType } from './groupByRiskType';

export const sortNdsEventsByOccurence = (events: NdsInternal[]) => {
  const groupedEvents = groupByRiskType(events);

  return flatten(
    Object.values(groupedEvents).sort(
      (group1, group2) => group2.length - group1.length
    )
  );
};
