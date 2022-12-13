import {
  InternalAssetFilters,
  InternalCommonFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalFilesFilters,
  InternalSequenceFilters,
  InternalTimeseriesFilters,
} from '@cognite/data-exploration';

export type Filters = {
  asset: InternalAssetFilters;
  timeseries: InternalTimeseriesFilters;
  sequence: InternalSequenceFilters;
  file: InternalFilesFilters;
  event: InternalEventsFilters;
  document: InternalDocumentFilter;
};

type CommonFacetsKeys = keyof InternalCommonFilters;

export type GlobalFilter = {
  phrase?: string;
  filters: {
    common: InternalCommonFilters;
    asset: Omit<Filters['asset'], CommonFacetsKeys>;
    timeseries: Omit<Filters['timeseries'], CommonFacetsKeys>;
    sequence: Omit<Filters['sequence'], CommonFacetsKeys>;
    file: Omit<Filters['file'], CommonFacetsKeys>;
    document: Omit<Filters['document'], CommonFacetsKeys>;
    event: Omit<Filters['event'], CommonFacetsKeys>;
  };
};

export type GlobalFilterKeys = keyof GlobalFilter['filters'];

export type DynamicFilter = {
  phrase?: string;
  filters: Filters;
};
