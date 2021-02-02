import { ReactElement } from 'react';
import {
  DataTransferObject,
  GenericResponseObject,
  SelectedDateRangeType,
} from 'typings/interfaces';
import { ColumnsType } from 'antd/es/table';

export type FilterSourceType = {
  sources: string[];
  selected: string | null;
  onSelectSource: (selected: string) => void;
  projects: DataTransferObject[];
  selectedProject: DataTransferObject | null;
  onSelectProject: (selected: DataTransferObject) => void;
};

export type FilterTargetType = {
  targets: string[];
  selected: string | null;
  onSelectTarget: (selected: string) => void;
  projects: DataTransferObject[];
  selectedProject: DataTransferObject | null;
  onSelectProject: (selected: DataTransferObject) => void;
};

export type FilterDataTypeType = {
  types: string[];
  selected: string | null;
  onSelectType: (selected: string | null) => void;
};

export type FilterDateType = {
  selectedRange: SelectedDateRangeType | null;
  onSelectDate: (selected: SelectedDateRangeType | null) => void;
};

export type FilterConfigurationType = {
  configurations: GenericResponseObject[];
  selected: GenericResponseObject | null;
  onSelectConfiguration: (selected: GenericResponseObject | null) => void;
};

export type FiltersProps = {
  source: FilterSourceType;
  target: FilterTargetType;
  configuration: FilterConfigurationType;
  datatype: FilterDataTypeType;
  date: FilterDateType;
  onNameSearchChange: (searchString: string) => void;
};

export interface FilterTypes {
  source: ReactElement | null;
  target: ReactElement | null;
  sourceProject: ReactElement | null;
  targetProject: ReactElement | null;
  dataTypes: ReactElement | null;
  config: ReactElement | null;
  date: ReactElement | null;
}

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

export type FilterListFiltersSource = string[] | GenericResponseObject[];

export type FilterListFilters = {
  source: FilterListFiltersSource;
  name: keyof FilterTypes;
  label: string;
  onSelect: (action: any) => void;
  value: string | null;
  visible: boolean;
}[];

export interface FilterListProps {
  filters: FilterListFilters;
  closeHandler: () => void;
  openFilter: keyof FilterTypes | '';
  toggleFilter: (name: keyof FilterTypes) => void;
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
