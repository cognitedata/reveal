import { DataTransferObject, GenericResponseObject } from 'typings/interfaces';
import { ColumnsType } from 'antd/es/table';
import { ProjectsResponse } from 'types/ApiInterface';
import { Range } from '@cognite/cogs.js';

export type DataTransfersError = {
  message: string;
  status: number;
};

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
  UPDATE_CONFIG = 'update_config',
}

interface Data {
  data: DataTransferObject[];
  rawColumns: ColumnsType<DataTransferObject>;
  allColumnNames: string[];
  selectedColumnNames: string[];
  columns: ColumnsType<DataTransferObject>;
}

export interface Config {
  sources: string[];
  selectedSource: string | null;
  selectedTarget: string | null;
  configurations: GenericResponseObject[];
  selectedConfiguration: GenericResponseObject | null;
  sourceProjects: ProjectsResponse[];
  selectedSourceProject: DataTransferObject | null;
  targetProjects: ProjectsResponse[];
  selectedTargetProject: DataTransferObject | null;
  selectedDateRange: Range;
  datatypes: string[];
  selectedDatatype: string | null;
}
export interface DataTransfersState {
  status: ProgressState;
  data: Data;
  config: Config;
  error: DataTransfersError | undefined;
}

export type DataTransfersAction =
  | { type: Action.LOAD }
  | { type: Action.SUCCEED; payload?: Data }
  | { type: Action.FAIL; error: DataTransfersError }
  | { type: Action.UPDATE_CONFIG; payload: Config };

export type UserAction =
  | { type: Action.ADD_COLUMN; payload: string }
  | { type: Action.REMOVE_COLUMN; payload: string };
