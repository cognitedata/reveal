import type {
  SorterResult,
  TableCurrentDataSource,
  TablePaginationConfig,
} from 'antd/es/table/interface';

export type ModelsTableFilters = { modelNameFilter: string };

export type AppState = {
  selectedModels: Array<number>;
  modelTableState: {
    filters: ModelsTableFilters;
    pagination?: TablePaginationConfig;
    sorter?: SorterResult<any>;
    sortedInfo?: TableCurrentDataSource<any>;
  };
};
