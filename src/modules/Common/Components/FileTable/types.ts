import { BaseTableProps } from 'react-base-table';
import { SelectFilter, TableDataItem } from 'src/modules/Common/types';

export type PaginatedTableProps<T> = {
  data: T[];
  sortKey?: string;
  reverse?: boolean;
  setSortKey?: (key: string) => void;
  setReverse?: (rev: boolean) => void;
  tableFooter?: JSX.Element | null;
  fetchedCount?: number;
};

type FileTableProps<T> = Omit<BaseTableProps<T>, 'data' | 'width'> & {
  data: T[];
  totalCount: number;
  onItemSelect: (item: T, selected: boolean) => void;
  onItemClick: (item: T, showFileDetailsOnClick?: boolean) => void;
  selectedIds: number[];
  allRowsSelected: boolean;
  onSelectAllRows: (value: boolean, filter?: SelectFilter) => void;
  onSelectPage: (fileIds: number[]) => void;
  modalView?: boolean;
  focusedId?: number | null;
};

export type FileListTableProps<T> = FileTableProps<T> &
  PaginatedTableProps<T> & {
    isLoading?: boolean;
  };

export type GridViewProps<T> = {
  data: T[];
  selectedIds: number[];
  onItemClick: (item: T) => void;
  renderCell: (cellProps: any) => JSX.Element;
  tableFooter?: JSX.Element | null;
  isLoading: boolean;
  overlayRenderer: () => JSX.Element;
  emptyRenderer: () => JSX.Element;
};

export type SortPaginate = {
  sortKey?: string;
  reverse?: boolean;
  currentPage: number;
  pageSize: number;
};

export type SortPaginateControls = SortPaginate & {
  setSortKey?: (key: string) => void;
  setReverse?: (reverse: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

export type FileGridTableProps<T> = Omit<BaseTableProps<T>, 'data' | 'width'> &
  PaginatedTableProps<T> &
  Omit<GridViewProps<TableDataItem>, 'overlayRenderer' | 'emptyRenderer'> & {
    totalCount: number;
    pagination?: boolean;
    onItemSelect?: (item: TableDataItem, selected: boolean) => void;
  };

export type MapTableTabKey = {
  activeKey: string;
  setActiveKey: (key: string) => void;
};
export type FileMapTableProps<T> = FileTableProps<T> &
  PaginatedTableProps<T> & {
    isLoading: boolean;
    mapTableTabKey: MapTableTabKey;
    pageSize: number;
    setPageSize: (size: number) => void;
  };
