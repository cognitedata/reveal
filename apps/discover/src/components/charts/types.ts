export type DataObject<T> = Record<Extract<T, keyof T>, any>;
export type GroupedData<T> = { [key: string]: T[] };

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ColorConfig {
  colors: { [x: string]: string };
  accessor: string;
  defaultColor: string;
  noDataColor?: string;
}
