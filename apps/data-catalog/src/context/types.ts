import { CreationDataSet } from '../utils/types';

export interface DataSetsState {
  selectedDataSet?: number;
  creationDataSet?: CreationDataSet;
  setSelectedDataSet: (selectedDataSet?: number) => void;
  setCreationDataSet: (creationDataSet: CreationDataSet) => void;
  mode: 'edit' | 'create';
  setMode: (mode: 'edit' | 'create') => void;
}
