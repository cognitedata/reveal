import { CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import {
  SequenceWithRelationshipLabels,
  TimeseriesWithRelationshipLabels,
} from 'containers';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetTable';
import { FileWithRelationshipLabels } from 'containers/Files/FileTable/FileTable';
import { ColumnKeys } from './constants';

// We recreated these types on our side to be less dependant on react-table.
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
  id: ColumnWithQuery;
  metadata: MetadataColumn;
} & {
  [key in typeof ColumnKeys[number]]: TableColumnDef;
};
