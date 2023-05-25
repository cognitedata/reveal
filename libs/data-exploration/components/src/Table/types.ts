import { Asset, CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileWithRelationshipLabels,
  SequenceWithRelationshipLabels,
} from '@data-exploration-lib/core';
import {
  AssetWithRelationshipLabels,
  TimeseriesWithRelationshipLabels,
} from '@data-exploration-lib/domain-layer';
import { ColumnKeys } from './constants';

type TableColumnDef = ColumnDef<
  TimeseriesWithRelationshipLabels &
    AssetWithRelationshipLabels &
    CogniteEvent &
    FileWithRelationshipLabels &
    SequenceWithRelationshipLabels
>;

type ColumnWithQuery = (query?: string) => TableColumnDef;

type RootAssetColumn = (
  onClick?: (rootAsset: Asset, resourceId?: number) => void
) => TableColumnDef;

type DirectAssetColumn = (
  onClick?: (directAsset: Asset, resourceId?: number) => void
) => TableColumnDef;

type MetadataColumn = (
  key: string,
  accessorFn?: (row: any) => string
) => TableColumnDef;

export type ResourceTableHashMap = {
  name: ColumnWithQuery;
  description: ColumnWithQuery;
  externalId: ColumnWithQuery;
  type: ColumnWithQuery;
  subtype: ColumnWithQuery;
  id: ColumnWithQuery;
  unit: ColumnWithQuery;
  source: ColumnWithQuery;
  rootAsset: RootAssetColumn;
  assets: DirectAssetColumn;
  metadata: MetadataColumn;
} & {
  [key in (typeof ColumnKeys)[number]]: TableColumnDef;
};
