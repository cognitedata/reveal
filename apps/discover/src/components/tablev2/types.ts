import { SortBy } from '../../pages/types';

export type TableResults = {
  [key: string]: boolean;
};

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
