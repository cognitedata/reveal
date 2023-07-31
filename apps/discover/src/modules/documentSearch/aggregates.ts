import { DocumentSearchCountAggregate } from '@cognite/sdk';

import {
  FILE_TYPE_KEY,
  LABELS_KEY,
  PAGE_COUNT_KEY,
  SOURCE_KEY,
  TOTAL_COUNT_KEY,
} from './constants';

export const aggregates: DocumentSearchCountAggregate[] = [
  {
    name: 'labels',
    aggregate: 'count',
    groupBy: [{ property: [LABELS_KEY] }],
  },
  {
    name: 'location',
    aggregate: 'count',
    groupBy: [{ property: SOURCE_KEY }],
  },
  {
    name: 'fileCategory',
    aggregate: 'count',
    groupBy: [{ property: [FILE_TYPE_KEY] }],
  },
  /**
   * We don't use aggregate result for lastcreated date so this is not necessary,
   * API only allows up to five aggregates to commenting this but keep the aggregrate
   * in case of future need
   */
  // {
  //   name: 'lastcreated',
  //   aggregate: 'dateHistogram',
  //   field: LAST_CREATED_KEY,
  //   interval: 'year',
  // },
  {
    name: TOTAL_COUNT_KEY,
    aggregate: 'count',
  },
  {
    name: PAGE_COUNT_KEY,
    aggregate: 'count',
    groupBy: [{ property: [PAGE_COUNT_KEY] }],
  },
];
