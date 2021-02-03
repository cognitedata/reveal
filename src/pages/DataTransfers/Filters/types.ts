import { ReactElement } from 'react';
import {
  DataTransferObject,
  GenericResponseObject,
  SelectedDateRangeType,
} from 'typings/interfaces';

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
  onReset: () => void;
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
