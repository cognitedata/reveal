import {
  ConfigurationsResponse,
  DataTransfersResponse,
  DatatypesResponse,
  ObjectsRevisionsResponse,
  ProjectsResponse,
  SourcesResponse,
} from 'types/ApiInterface';
import { Range, TableProps } from '@cognite/cogs.js';

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
}

interface Data {
  data: DataTypesTableData[];
  rawColumns: TableProps<DataTypesTableData>['columns'];
  allColumnNames: string[];
  selectedColumnNames: string[];
  columns: TableProps<DataTypesTableData>['columns'];
}

export interface DataTypesFilters {
  sources: SourcesResponse[];
  selectedSource: string | null;
  selectedTarget: string | null;
  configurations: ConfigurationsResponse[];
  selectedConfiguration: ConfigurationsResponse | null;
  sourceProjects: ProjectsResponse[];
  selectedSourceProject: ProjectsResponse | null;
  targetProjects: ProjectsResponse[];
  selectedTargetProject: ProjectsResponse | null;
  selectedDateRange: Range;
  datatypes: DatatypesResponse[];
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
  | { type: Action.SUCCEED; payload?: Data }
  | { type: Action.FAIL; error: DataTransfersError }
  | { type: Action.UPDATE_FILTERS; payload: DataTypesFilters };

export type UserAction =
  | { type: Action.ADD_COLUMN; payload: string }
  | { type: Action.REMOVE_COLUMN; payload: string };

export interface DataTypesTableData extends ObjectsRevisionsResponse {
  report: DataTransfersResponse['status'];
  status: DataTransfersResponse['status'];
}
