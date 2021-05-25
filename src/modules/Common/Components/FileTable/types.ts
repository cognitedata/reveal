import { BaseTableProps } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/types';

export type PaginatedTableProps<T> = {
  data: T[];
  totalCount: number;
  onRowSelect: (item: T, selected: boolean) => void;
  onRowClick: (item: T, showFileDetailsOnClick?: boolean) => void;
  selectedFileId?: number | null;
};
export type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'data'> &
  PaginatedTableProps<TableDataItem>;

export type FileExplorerTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'data'
> &
  PaginatedTableProps<TableDataItem>;
