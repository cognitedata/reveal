import { DocumentsCountAggregate } from '@cognite/sdk-playground';

import {
  FILE_TYPE_KEY,
  LABELS_KEY,
  PAGE_COUNT_KEY,
  SOURCE_KEY,
  TOTAL_COUNT_KEY,
} from './constants';

export const aggregates: DocumentsCountAggregate[] = [
  {
    name: 'labels',
    aggregate: 'count',
    groupBy: [LABELS_KEY],
  },
  {
    name: 'location',
    aggregate: 'count',
    groupBy: [SOURCE_KEY],
  },
  {
    name: 'filetype',
    aggregate: 'count',
    groupBy: [FILE_TYPE_KEY],
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
    groupBy: [PAGE_COUNT_KEY],
  },
];
