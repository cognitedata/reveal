import flatten from 'lodash/flatten';

import { NptInternal } from '../types';

import { groupByNptCode } from './groupByNptCode';

export const sortNptEventsByOccurence = (events: NptInternal[]) => {
  const groupedEvents = groupByNptCode(events);

  return flatten(
    Object.values(groupedEvents).sort(
      (group1, group2) => group2.length - group1.length
    )
  );
};
