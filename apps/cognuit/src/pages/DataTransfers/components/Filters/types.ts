import { ReactElement } from 'react';
import { DataTypesFilters } from 'contexts/types/dataTransfersTypes';
import {
  ConfigurationsResponse,
  DatatypesResponse,
  ProjectsResponse,
} from 'types/ApiInterface';

export type FilterSourceType = {
  sources: string[];
  selected: DataTypesFilters['selectedSource'];
  onSelectSource: (selected: DataTypesFilters['selectedSource']) => void;
  projects: ProjectsResponse[];
  selectedProject: DataTypesFilters['selectedSourceProject'];
  onSelectProject: (
    selected: DataTypesFilters['selectedSourceProject']
  ) => void;
};

export type FilterTargetType = {
  targets: string[];
  selected: DataTypesFilters['selectedTarget'];
  onSelectTarget: (selected: DataTypesFilters['selectedTarget']) => void;
  projects: ProjectsResponse[];
  selectedProject: DataTypesFilters['selectedTargetProject'];
  onSelectProject: (
    selected: DataTypesFilters['selectedTargetProject']
  ) => void;
};

export type FilterDataTypeType = {
  types: DatatypesResponse[];
  selected: DataTypesFilters['selectedDatatype'];
  onSelectType: (selected: DataTypesFilters['selectedDatatype']) => void;
};

export type FilterDateType = {
  selectedRange: DataTypesFilters['selectedDateRange'];
  onSelectDate: (selected: DataTypesFilters['selectedDateRange']) => void;
};

export type FilterConfigurationType = {
  configurations: ConfigurationsResponse[];
  selected: DataTypesFilters['selectedConfiguration'];
  onSelectConfiguration: (
    selected: DataTypesFilters['selectedConfiguration']
  ) => void;
};

export type FiltersProps = {
  source: FilterSourceType;
  target: FilterTargetType;
  configuration: FilterConfigurationType;
  datatype: FilterDataTypeType;
  date: FilterDateType;
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

export type FilterListFiltersSource =
  | FiltersProps['configuration']['configurations']
  | FiltersProps['source']['sources']
  | FiltersProps['source']['projects']
  | FiltersProps['target']['targets']
  | FiltersProps['target']['projects'];

export type FilterListFilters = {
  name: keyof FilterTypes;
  label: string;
  source: FilterListFiltersSource;
  onSelect: (action: any) => void;
  visible: boolean;
  value: string | null | undefined;
}[];

export interface FilterListProps {
  filters: FilterListFilters;
  closeHandler: () => void;
  openFilter: keyof FilterTypes | '';
  toggleFilter: (name: keyof FilterTypes) => void;
  onReset?: () => void;
  resetText?: string;
  placeholder?: string;
}
