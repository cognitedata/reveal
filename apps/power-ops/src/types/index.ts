import {
  Matrix,
  BidProcessResult,
  WorkflowSchemaWithProcesses,
} from '@cognite/power-ops-api-types';

export interface TableData {
  id: number | undefined;
  [key: string]: any;
}

export interface TableRow {
  [key: string]: string;
}

export interface TableColumn {
  Header: string | undefined;
  accessor?: string | undefined;
  disableSortBy: boolean;
  columns?: SubColumn[];
  sticky?: string;
  id?: string;
}

export interface SubColumn {
  Header: string | undefined;
  id?: string;
  accessor: string | (() => string) | undefined;
}

export interface MatrixWithData extends Matrix {
  columnHeaders: Array<string | number>;
  dataRows: Array<string | number>[];
}

export interface BidProcessResultWithData extends BidProcessResult {
  totalMatrixWithData: MatrixWithData;
  plantMatrixesWithData: {
    plantName: string;
    matrixWithData: MatrixWithData;
  }[];
}

export type WorkflowSchemaEditable = Omit<
  WorkflowSchemaWithProcesses,
  'id' | 'cdfProject'
>;
