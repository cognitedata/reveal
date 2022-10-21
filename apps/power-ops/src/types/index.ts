import {
  BidProcessResult,
  WorkflowSchemaWithProcesses,
  ScenarioObjectiveOutputCDFModel,
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

export enum SOLVER_STATUS_TYPES {
  INFEASIBLE = 'Integer infeasible',
  OPTIMAL = 'Optimal solution is available',
}

export interface ShopRunPenalties
  extends Omit<ScenarioObjectiveOutputCDFModel, 'shopProcessEventExternalId'> {
  scenario: string;
}

export enum PAGES {
  HOME = '/home',
  PRICE_AREA = '/day-ahead-market/:priceAreaExternalId',
  PORTFOLIO = '/portfolio', // Deprecated, should use "DAY_AHEAD_MARKET"
  DAY_AHEAD_MARKET = '/day-ahead-market',
  WORKFLOWS_SINGLE = '/workflows/:workflowExternalId',
  WORKFLOWS = '/workflows',
  WORKFLOW_SCHEMAS = '/workflow-schemas',
  MONITORING = '/monitoring',
  LOGOUT = '/logout',
}
