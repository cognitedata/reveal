import { SequenceItem, SequenceColumnBasicInfo } from '@cognite/sdk';

export declare class SequenceRow extends Array<SequenceItem> {
  rowNumber: number;
  columns: SequenceColumnBasicInfo[];
  constructor(
    rowNumber: number,
    values: SequenceItem[],
    columns: SequenceColumnBasicInfo[]
  );
}

export interface TableData {
  id: number;
  [key: string]: any;
}

export interface TableRow {
  [key: string]: string;
}

export interface Cols {
  Header: string | undefined;
  accessor: string | undefined;
  disableSortBy: boolean;
  sticky?: string;
  id?: number;
}

export type BidMatrixData = {
  id: number;
  name: string;
  description: string;
  externalid: string;
  startTime: string;
  endTime: string;
  time: Date;
  bidmatrix?: {
    columns: any;
    dataSource: TableData[];
  };
};

export interface Matrix {
  method: string;
  externalId: string;
  startTime: number;
}

export interface Plant {
  id: number;
  externalId: string;
  name: string;
}

export interface ProductionValues {
  method: string;
  marketProductionExternalId: string;
  calculatedProductionExternalId: string;
}

export interface Scenario {
  id: number;
  name: string;
  externalId: string;
  totalProductionValues: ProductionValues[];
  plantProductionValues: {
    plantId: number;
    productionValues: ProductionValues[];
  }[];
}

export interface PriceArea {
  id: number;
  externalId: string;
  name: string;
  plants: Plant[];
  totalMatrixes: Matrix[];
  plantMatrixes: { plantId: number; matrixes: Matrix[] }[];
  priceScenarios: Scenario[];
  mainScenarioId: number;
}
