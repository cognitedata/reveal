import {
  AssetFilterProps,
  DateRange,
  EventFilter,
  FileFilterProps,
  IdEither,
  Metadata,
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
type CommonFacets = {
  assetSubtreeIds?: IdEither[];
  dataSetIds?: IdEither[];
  metadata?: Metadata;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
};

type CommonFacetsKeys =
  | 'assetSubtreeIds'
  | 'dataSetIds'
  | 'metadata'
  | 'createdTime'
  | 'lastUpdatedTime';

export type GlobalFilter = {
  phrase?: string;
  filters: {
    common: CommonFacets;
    asset: Omit<Filters['asset'], CommonFacetsKeys>;
    timeseries: Omit<Filters['timeseries'], CommonFacetsKeys>;
    sequence: Omit<Filters['sequence'], CommonFacetsKeys>;
    file: Omit<Filters['file'], CommonFacetsKeys>;
    event: Omit<Filters['event'], CommonFacetsKeys>;
  };
};

export type DynamicFilter = {
  phrase?: string;
  filters: Filters;
};
