import { BaseTableProps } from 'react-base-table';
import { SelectFilter, TableDataItem } from 'src/modules/Common/types';

export type PaginationProps<T> = {
  sortKey: string;
  reverse: boolean;
  setSortKey: (key: string) => void;
  setReverse: (rev: boolean) => void;
  data: T[];
  tableFooter?: JSX.Element | null;
};

export type PaginatedTableProps<T> = {
  data: T[];
  totalCount: number;
  onRowSelect: (item: T, selected: boolean) => void;
  onRowClick: (item: T, showFileDetailsOnClick?: boolean) => void;
  selectedFileId?: number | null;
};
export type FileTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'data' | 'width'
> &
  PaginatedTableProps<TableDataItem> & {
    selectedRowIds: number[];
    allRowsSelected: boolean;
    onSelectAllRows: (value: boolean, filter?: SelectFilter) => void;
  };

export type FileExplorerTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'data' | 'width'
> &
  PaginatedTableProps<TableDataItem> & {
    modalView?: boolean;
    selectedRowIds: number[];
    allRowsSelected: boolean;
    onSelectAllRows: (value: boolean, filter?: SelectFilter) => void;
  };
