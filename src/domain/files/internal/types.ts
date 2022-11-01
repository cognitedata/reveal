import { FileFilterProps } from '@cognite/sdk';

// TODO: Remove the 'file filter props' and convert to internal types
export type InternalFilesFilters = Omit<
  FileFilterProps,
  'assetSubtreeIds' | 'dataSetIds' | 'labels'
> & {
  assetSubtreeIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
  labels?: { label?: string; value: string }[];
};
