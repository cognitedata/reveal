import { BaseTableProps } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/types';

export type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'> & {
  onRowSelect: (id: number, selected: boolean) => void;
};

export type FileExplorerTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'width'
> & {
  onRowSelect: (id: number, selected: boolean) => void;
  onRowClick: (id: number) => void;
  selectedFileId: number | null;
};
