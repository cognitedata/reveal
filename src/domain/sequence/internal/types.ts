import { SequenceFilter } from '@cognite/sdk';

// TODO: Remove the 'file filter props' and convert to internal types
export type InternalSequenceFilters = Omit<
  Required<SequenceFilter>['filter'],
  'assetSubtreeIds' | 'dataSetIds'
> & {
  assetSubtreeIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
};
