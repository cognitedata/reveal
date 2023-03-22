import { AggregateResponse, AssetFilterProps } from '@cognite/sdk';
import {
  AdvancedFilter,
  AssetsProperties,
} from '@data-exploration-lib/domain-layer';

/**
 * DOCUMENTATION:
 * https://cognitedata.atlassian.net/wiki/spaces/SFAA/pages/3867312421/ApiSpec+Assets+Events+advanced+aggregation+capabilities
 */

export type AssetsAggregateFilters = {
  filter?: AssetFilterProps;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
};

export type AssetsAggregateOptions =
  | {
      aggregate?: 'uniqueProperties';
    }
  | {
      aggregate: 'count';
      properties?: [AssetsAggregateProperty];
    }
  | {
      aggregate: 'approximateCardinality' | 'uniqueValues';
      properties: [AssetsAggregateProperty];
    };

export type AssetsAggregateRequestPayload = AssetsAggregateFilters &
  AssetsAggregateOptions & {
    path?: string[];
  };

export interface AssetsAggregateProperty {
  property: [AssetProperty] | AssetMetadataProperty;
}

export interface AssetsAggregateUniquePropertiesResponse
  extends AggregateResponse {
  value: AssetsAggregateProperty;
  values: [AssetsAggregateProperty];
}

export interface AssetsAggregateUniqueValuesResponse extends AggregateResponse {
  values: [string];
}

export interface AssetsMetadataAggregateResponse extends AggregateResponse {
  // @deprecated use 'values'
  value: string;
  values: string[];
}

export type AssetProperty = 'labels' | 'source';

export type AssetMetadataProperty = ['metadata', string];
