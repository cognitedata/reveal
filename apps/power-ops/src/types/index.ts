import { Matrix, PriceArea } from '@cognite/power-ops-api-types';
import { SequenceItem, SequenceColumnBasicInfo } from '@cognite/sdk';

export class SequenceRow extends Array<SequenceItem> {
  constructor(
    public rowNumber: number,
    values: SequenceItem[],
    public columns: SequenceColumnBasicInfo[]
  ) {
    super(...values);
  }
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
  sequenceRows: SequenceRow[];
}

export interface PriceAreaWithData extends PriceArea {
  totalMatrixesWithData: MatrixWithData[];
  plantMatrixesWithData: {
    plantExternalId: string;
    matrixesWithData: MatrixWithData[];
  }[];
}
