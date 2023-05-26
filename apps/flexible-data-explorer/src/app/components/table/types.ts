import { ColumnDef } from '@tanstack/react-table';

import { Asset, CogniteEvent } from '@cognite/sdk';

type TableColumnDef = ColumnDef<any, any>;

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
  // assets: DirectAssetColumn;
  // metadata: MetadataColumn;
} & {
  [key in any]: TableColumnDef;
};
