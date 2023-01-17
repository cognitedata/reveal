import { CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import {
  SequenceWithRelationshipLabels,
  TimeseriesWithRelationshipLabels,
} from '@data-exploration-components/containers';
import { AssetWithRelationshipLabels } from '@data-exploration-components/containers/Assets/AssetTable/AssetTable';
import { FileWithRelationshipLabels } from '@data-exploration-components/containers/Files/FileTable/FileTable';
import { ColumnKeys } from './constants';

// We recreated these types on our side to be less dependent on react-table.
// This is same to ColumnSort from react-table
export type TableSortBy = {
  id: string;
  desc: boolean;
};

type TableColumnDef = ColumnDef<
  TimeseriesWithRelationshipLabels &
    AssetWithRelationshipLabels &
    CogniteEvent &
    FileWithRelationshipLabels &
    SequenceWithRelationshipLabels
>;

type ColumnWithQuery = (query?: string) => TableColumnDef;
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
  metadata: MetadataColumn;
} & {
  [key in (typeof ColumnKeys)[number]]: TableColumnDef;
};
