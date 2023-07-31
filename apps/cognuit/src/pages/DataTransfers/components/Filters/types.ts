import { ReactElement } from 'react';
import { DataTypesFilters } from 'contexts/types/dataTransfersTypes';
import { ConfigurationResponse } from 'types/ApiInterface';

export type FilterConfigurationType = {
  configurations: ConfigurationResponse[];
  selected: DataTypesFilters['selectedConfiguration'];
  onSelectConfiguration: (
    selected: DataTypesFilters['selectedConfiguration']
  ) => void;
};

export type FiltersProps = {
  configuration: FilterConfigurationType;
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
  | FiltersProps['configuration']['configurations'];

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
