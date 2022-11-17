import { CogniteEvent } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import {
  SequenceWithRelationshipLabels,
  TimeseriesWithRelationshipLabels,
} from 'containers';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetTable';
import { FileWithRelationshipLabels } from 'containers/Files/FileTable/FileTable';
import { ColumnKeys } from '../Table/constants';

// We recreated these types on our side to be less dependant on react-table.
// This is same to ColumnSort from react-table
export type TableSortBy = {
  id: string;
  desc: boolean;
};

export type ResourceTableHashMap2 = {
  [key in typeof ColumnKeys[number]]: ColumnDef<
    TimeseriesWithRelationshipLabels &
      AssetWithRelationshipLabels &
      CogniteEvent &
      FileWithRelationshipLabels &
      SequenceWithRelationshipLabels
  >;
};
