import {
  BidProcessResult,
  WorkflowSchemaWithProcesses,
  ScenarioObjectiveOutputCDFModel,
  BenchmarkingWaterCourses,
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

export type BenchmarkingTypeOption =
  | 'absolute'
  | BenchmarkingWaterCourses['methods'][number]['value'];

export type BenchmarkingTimeSeriesPoints = {
  [timestamp: string]: number;
};

export const SECTIONS = {
  DAY_AHEAD_MARKET: 'day-ahead-market',
  BALANCING_MARKETS: 'balancing-markets',
  BENCHMARKING: 'performance',
  PRICE_SCENARIOS: 'price-scenarios',
  TOTAL: 'total',
  WORKFLOWS: 'workflows',
};

export const PAGES = {
  DAY_AHEAD_BENCHMARKING: `/${SECTIONS.DAY_AHEAD_MARKET}/:priceAreaExternalId/${SECTIONS.BENCHMARKING}`,
  PRICE_AREA: `/${SECTIONS.DAY_AHEAD_MARKET}/:priceAreaExternalId`,
  DAY_AHEAD_MARKET: `/${SECTIONS.DAY_AHEAD_MARKET}`,
  RKOM_PERFORMANCE: `/${SECTIONS.BALANCING_MARKETS}/rkom/${SECTIONS.BENCHMARKING}`,
  RKOM_BID: `/${SECTIONS.BALANCING_MARKETS}/rkom/bid`,
  BALANCING_MARKETS: `/${SECTIONS.BALANCING_MARKETS}`,
  WORKFLOWS_SINGLE: `/${SECTIONS.WORKFLOWS}/:workflowExternalId`,
  WORKFLOWS: `/${SECTIONS.WORKFLOWS}`,
  WORKFLOW_SCHEMAS: '/workflow-schemas',
  MONITORING: '/monitoring',
  LOGOUT: '/logout',

  /** @deprecated - use "DAY_AHEAD_MARKET" instead */
  PORTFOLIO: '/portfolio',
};
