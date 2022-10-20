import {
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

export interface BidMatrixData {
  headerRow: (string | number)[];
  dataRows: [string, ...number[]][];
}

export interface BidProcessResultWithData extends BidProcessResult {
  totalMatrixWithData: BidMatrixData;
  plantMatrixesWithData: {
    plantName: string;
    matrixWithData: BidMatrixData;
  }[];
}

export type WorkflowSchemaEditable = Omit<
  WorkflowSchemaWithProcesses,
  'id' | 'cdfProject'
>;

export enum PAGES {
  HOME = '/home',
  MONITORING = '/monitoring',
  WORKFLOWS_SINGLE = '/workflows/:workflowExternalId',
  WORKFLOWS = '/workflows',
  PRICE_AREA = '/portfolio/:priceAreaExternalId',
  PORTFOLIO = '/portfolio',
  WORKFLOW_SCHEMAS = '/workflow-schemas',
  LOGOUT = '/logout',
}
