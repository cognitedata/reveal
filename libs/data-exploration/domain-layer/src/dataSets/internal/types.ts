import { DataSet } from '@cognite/sdk';

export type DataSetInternal = DataSet;

export type DataSetWithCount = DataSetInternal & { count: number };
