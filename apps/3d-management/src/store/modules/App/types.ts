import type {
  SorterResult,
  TableCurrentDataSource,
  PaginationConfig,
} from 'antd/lib/table';

export type ModelsTableFilters = { modelNameFilter: string };

export type AppState = {
  selectedModels: Array<number>;
  modelTableState: {
    pagination?: PaginationConfig;
    filters: ModelsTableFilters;
    sorter?: SorterResult<any>;
    sortedInfo?: TableCurrentDataSource<any>;
  };
};
