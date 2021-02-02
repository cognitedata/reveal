import { DataTransferObject } from 'typings/interfaces';
import { ColumnsType } from 'antd/es/table';

export enum ProgressState {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum Action {
  LOAD = 'load',
  SUCCEED = 'succeed',
  FAIL = 'fail',
  ADD_COLUMN = 'add_column',
  REMOVE_COLUMN = 'remove_column',
}

export type DataTransfersError = {
  message: string;
  status: number;
};

interface Data {
  data: DataTransferObject[];
  rawColumns: ColumnsType<DataTransferObject>;
  allColumnNames: string[];
  selectedColumnNames: string[];
  columns: ColumnsType<DataTransferObject>;
}
export interface DataTransfersState {
  status: ProgressState;
  data: Data;
  error: DataTransfersError | undefined;
}

export type DataTransfersAction =
  | { type: Action.LOAD }
  | { type: Action.SUCCEED; payload?: Data }
  | { type: Action.FAIL; error: DataTransfersError };

export type UserAction =
  | { type: Action.ADD_COLUMN; payload: string }
  | { type: Action.REMOVE_COLUMN; payload: string };
