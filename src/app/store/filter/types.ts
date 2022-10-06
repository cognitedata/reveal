import {
  AssetFilterProps,
  DateRange,
  EventFilter,
  FileFilterProps,
  IdEither,
  SequenceFilter,
  TimeseriesFilter,
} from '@cognite/sdk';

export type Filters = {
  asset: AssetFilterProps;
  timeseries: TimeseriesFilter;
  sequence: Required<SequenceFilter>['filter'];
  file: FileFilterProps;
  event: EventFilter;
};
export type CommonFacets = {
  assetSubtreeIds?: IdEither[];
  dataSetIds?: IdEither[];
  // metadata?: Metadata;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  externalIdPrefix?: string;
};

type CommonFacetsKeys = keyof CommonFacets;

export type GlobalFilter = {
  phrase?: string;
  filters: {
    common: CommonFacets;
    asset: Omit<AssetFilterProps, CommonFacetsKeys>;
    timeseries: Omit<Filters['timeseries'], CommonFacetsKeys>;
    sequence: Omit<Filters['sequence'], CommonFacetsKeys>;
    file: Omit<Filters['file'], CommonFacetsKeys>;
    event: Omit<Filters['event'], CommonFacetsKeys>;
  };
};

export type GlobalFilterKeys = keyof GlobalFilter['filters'];

export type DynamicFilter = {
  phrase?: string;
  filters: Filters;
};
