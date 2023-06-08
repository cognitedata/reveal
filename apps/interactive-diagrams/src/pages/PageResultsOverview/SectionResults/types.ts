import { StatusType } from '@interactive-diagrams-app/components/Filters';

export type SelectionFilter = {
  nameQuery?: string;
  dataSetIds?: number[];
  labels?: string[];
  fileTypes?: string[];
  status?: StatusType[];
};
