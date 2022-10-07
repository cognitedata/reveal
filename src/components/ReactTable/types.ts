import { CogniteEvent } from '@cognite/sdk';
import {
  SequenceWithRelationshipLabels,
  TimeseriesWithRelationshipLabels,
} from 'containers';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetNewTable';
import { FileWithRelationshipLabels } from 'containers/Files/FileTable/FileNewTable';
import { Column } from 'react-table';
import { ColumnKeys } from './constants';

export type ResourceTableHashMap = {
  [key in typeof ColumnKeys[number]]: Column<
    TimeseriesWithRelationshipLabels &
      AssetWithRelationshipLabels &
      CogniteEvent &
      FileWithRelationshipLabels &
      SequenceWithRelationshipLabels
  >;
};
