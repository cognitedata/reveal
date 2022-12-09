import { Column, IdType, Row, TableOptions } from 'react-table';
import { IconType } from '@cognite/cogs.js';

export type TableData = Record<string, any>;

export type TableResults = Record<string, boolean>;

export interface TableProps<T extends TableData> {
  columns: (Column<T> & { filterIcon?: string | IconType })[];
  dataSource: T[];
  locale?: {
    emptyText?: React.ReactNode;
    goTo?: React.ReactNode;
  };
  showHeader?: boolean;
  pagination?: boolean;
  onRowClick?: (row: Row<T>) => void;
  renderSubRowComponent?: (row: Row<T>) => React.ReactNode;
  onRow?: (
    data: T,
    index?: number,
    row?: Omit<Row<T>, 'original' | 'index'>
  ) => React.HTMLAttributes<HTMLElement>;
  rowKey?: (data: T, index?: number) => string;
  rowClassName?: (data: T, index?: number) => string;

  onSelectionChange?: (nextSelected: T[]) => void;
  defaultSelectedIds?: Record<IdType<T>, boolean>;
  expandedIds?: TableResults;
  expandable?: boolean;
  resizable?: boolean;
  filterable?: boolean;
  pageSize?: number;
  selectorPosition?: 'left' | 'right';
  initalPageIndex?: number;
  onPageIndexChange?: (index: number) => void;
  blockLayout?:
    | false
    | {
        minWidth: number;
        width: number;
        maxWidth: number;
      };
  flexLayout?:
    | false
    | {
        minWidth: number;
        width: number;
        maxWidth: number;
      };
  tableConfig?: TableOptions<T>;
}
