import {
  ConfigurationsResponse,
  DatatypesResponse,
  ProjectsResponse,
} from 'types/ApiInterface';
import { Range } from '@cognite/cogs.js';
import {
  DataTransfersTableData,
  DataTransfersTableKeys,
} from 'pages/DataTransfers/types';

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
  UPDATE_FILTERS = 'update_filters',
  CLEAR = 'clear',
  TOGGLE_DETAIL_VIEW = 'toggle_detail_view',
}

interface Data {
  data: DataTransfersTableData[];
  allColumnNames: DataTransfersTableKeys[];
  selectedColumnNames: string[];
}

export interface DataTypesFilters {
  selectedSource: string | null;
  selectedTarget: string | null;
  selectedConfiguration: ConfigurationsResponse | null;
  selectedSourceProject: ProjectsResponse | null;
  selectedTargetProject: ProjectsResponse | null;
  selectedDateRange: Range;
  selectedDatatype: DatatypesResponse | null;
}

export interface DataTransfersState {
  status: ProgressState;
  data: Data;
  filters: DataTypesFilters;
  error: DataTransfersError | undefined;
}

export type DataTransfersAction =
  | { type: Action.LOAD }
  | { type: Action.CLEAR }
  | { type: Action.SUCCEED; payload?: Data }
  | { type: Action.FAIL; error: DataTransfersError }
  | { type: Action.UPDATE_FILTERS; payload: DataTypesFilters };

export type UserAction =
  | { type: Action.ADD_COLUMN; payload: string }
  | { type: Action.REMOVE_COLUMN; payload: string };
