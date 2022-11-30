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
  Header: string;
  accessor?: string;
  disableSortBy: boolean;
  columns?: SubColumn[];
  sticky?: string;
  id?: string;
}

export interface SubColumn {
  Header: string;
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
  'id' | 'cdfProject' | 'enabled'
>;

export enum SOLVER_STATUS_TYPES {
  INFEASIBLE = 'Integer infeasible',
  OPTIMAL = 'Optimal solution is available',
}

export interface ShopRunPenalties
  extends Omit<ScenarioObjectiveOutputCDFModel, 'shopProcessEventExternalId'> {
  scenario: string;
}

export type RKOMTableData = {
  name: string;
  subRows: {
    watercourseName: string;
    name: string;
    generationDate: string;
    bidDate: string;
    minimumPrice: string;
    premiumPrice: string;
    penalties?: string;
    subRows: [
      {
        sequenceExternalId: string;
      }
    ];
  }[];
}[];

export enum PAGES {
  HOME = '/home',
  PRICE_AREA = '/day-ahead-market/:priceAreaExternalId',
  /** @deprecated - use "DAY_AHEAD_MARKET" instead */
  PORTFOLIO = '/portfolio',
  DAY_AHEAD_MARKET = '/day-ahead-market',
  BALANCING_MARKETS = '/balancing-markets',
  RKOM_BID = '/balancing-markets/rkom/bid',
  RKOM_PERFORMANCE = '/balancing-markets/rkom/performance',
  WORKFLOWS_SINGLE = '/workflows/:workflowExternalId',
  WORKFLOWS = '/workflows',
  WORKFLOW_SCHEMAS = '/workflow-schemas',
  MONITORING = '/monitoring',
  LOGOUT = '/logout',
}
