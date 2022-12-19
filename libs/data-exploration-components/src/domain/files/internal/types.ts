import { FileFilterProps, Metadata } from '@cognite/sdk';

// TODO: Remove the 'file filter props' and convert to internal types
export type InternalFilesFilters = Omit<
  FileFilterProps,
  'assetSubtreeIds' | 'dataSetIds' | 'labels' | 'metadata'
> & {
  assetSubtreeIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
  labels?: { label?: string; value: string }[];
  metadata?: { key: string; value: string }[];
};

export interface OldFilesFilters
  extends Omit<InternalFilesFilters, 'metadata'> {
  metadata?: Metadata;
}
