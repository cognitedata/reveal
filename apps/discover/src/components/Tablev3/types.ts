import React from 'react';
import { Cell, Row, TableOptions } from 'react-table';

import { SortBy } from '../../pages/types';

import { RowProps } from './index';
import { TableResults } from './resultTypes';

type IndeterminateIds = TableResults;
type SelectedIds = TableResults;
export type { TableResults } from './resultTypes';
export type HandleRowClick = (rowInformation: any) => void;
export type HandleRowMouseEnter = (rowInformation: any) => void;
export type HandleRowMouseLeave = (rowInformation: any) => void;
export type HandleSort = (sortBy: SortBy[]) => void;
export type RenderRowSubComponent = ({ row }: any) => React.ReactNode;

// eslint-disable-next-line @typescript-eslint/ban-types
export interface TableProps<T extends Object> extends TableOptions<T> {
  checkIfCheckboxEnabled?: (row: any) => boolean;
  columns: any[];
  /**
   * Add a padding to the left side of every row in the table.
   * use a string like "30px" or set to true to space it under the checkbox.
   */
  indent?: string | true;
  data: T[];
  highlightedIds?: TableResults;
  expandedIds?: TableResults;
  disabledRowClickCells?: string[];
  handleDoubleClick?: HandleRowClick;
  handleMouseEnter?: HandleRowMouseEnter;
  handleMouseLeave?: HandleRowMouseLeave;
  handleRowClick?: HandleRowClick;
  Footer?: React.FC;
  handleRowSelect?: (row: RowProps<T>, nextState: boolean) => void; // checkbox
  handleRowsSelect?: (value: boolean) => void;
  handleSort?: HandleSort;
  /**
   * If set to true, the table won't render the header row.
   */
  hideHeaders?: boolean;
  id: string;
  indeterminateIds?: IndeterminateIds;
  options?: Options;
  renderChildren?: ({ selected }: { selected: T[] }) => React.ReactNode;
  renderRowOverlayComponent?: RenderRowSubComponent;
  renderRowHoverComponent?: RenderRowSubComponent;
  renderRowSubComponent?: RenderRowSubComponent;
  scrollTable?: boolean;
  selectedIds?: SelectedIds;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ColumnType<T extends Object> {
  Header: string | '() => void' | React.ReactElement;
  accessor: string | ((value: T) => string) | JSX.Element;
  id?: string;
  title?: string;
  /**
   * The width of the column as a string. Defaults to '140px'.
   * Note: This prop also acts as the minimum width of the column.
   * Generally, you want to use pixels here, and not fr.
   *
   * NOTE: Every table needs at least 1 column with a maxWidth of 1fr to be responsive
   *
   * @example '120px'
   * @example '1fr'
   */
  width: string;
  /**
   * The maximum width of the column as a string. If undefined, this will be the
   * same as the width prop. (To fill the remaining width, set it to 1fr and do
   * not use a percentage here)
   *
   * NOTE: Every table needs at least 1 column with a maxWidth of 1fr to be responsive
   *
   * @example '120px'
   * @example '1fr'
   */
  maxWidth?: string;
  order?: number;
  Cell?: (props: Cell<T>) => JSX.Element | string;
  sortType?: (
    row1: Row<T>,
    row2: Row<T>,
    id: string,
    desc?: string
  ) => number | string;
  disableSorting?: boolean;
  displayFullText?: boolean;
  /**
   * Make the column sticky to the left when scrolling horizontally.
   * If the previous column(s) are not set to sticky,
   * the sticky columns are scrolled upto left most position and locked.
   *
   * NOTE: The columns should have `width` property defined to work this properly.
   */
  stickyColumn?: boolean;
}

export interface RowOptions {
  selectedStyle?: string;
  hoveredStyle?: string;
  freezeHoverComponentOnRow?: string;
  [x: string]: any;
}

export interface Options {
  checkable?: boolean; // show checkbox on left of row
  hideScrollbars?: boolean; // nested tables don't want the nice scroll bars
  rowOptions?: RowOptions;
  height?: string; // height of the table
  hideBorders?: boolean; // hide table borders
  flex?: boolean;
  expandable?: boolean;
  pagination?: {
    enabled?: boolean;
    pageSize: number;
  };
  manualSortBy?: boolean;
  sortBy?: SortBy[];
  disableSorting?: boolean;
  freezeHoverComponentOnRow?: string;
}
