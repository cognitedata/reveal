import { Matrix, BidProcessResult } from '@cognite/power-ops-api-types';

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

export type Statuses = {
  failed: number;
  finished: number;
  triggered: number;
  running: number;
};

export type Process = {
  id: number;
  cdfProject: string;
  collectionId: number;
  eventCreationTime: string;
  eventStartTime: string;
  eventEndTime: string;
  eventExternalId: string;
  eventType: string;
  status: string;
};
