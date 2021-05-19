import { BaseTableProps } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/types';

export type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'> & {
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
};

export type FileExplorerTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'width'
> & {
  totalCount: number;
  onRowSelect: (item: TableDataItem, selected: boolean) => void;
  onRowClick: (item: TableDataItem) => void;
  selectedFileId: number | null;
};
