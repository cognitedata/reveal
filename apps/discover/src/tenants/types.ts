/* eslint-disable camelcase */

// Todo(PP-678): refactor camelcase ids eslint disable while refactoring config structure

import { FeatureCollection } from 'geojson';
import type {
  MapboxOptions,
  AnyLayer,
  CustomLayerInterface,
} from 'maplibre-gl';

import { ProjectConfigMapLayers } from '@cognite/discover-api-types';
import { AzureTelemetryOptions } from '@cognite/react-azure-telemetry';
import {
  Asset,
  CogniteClient,
  ListResponse,
  Sequence,
  SequenceFilter as SdkSequenceFilter,
  DocumentFilter,
} from '@cognite/sdk';

import { Modules } from 'modules/sidebar/types';
import { SequenceFilter } from 'modules/wellSearch/service';
import { LogTypes, TrackType } from 'modules/wellSearch/types';

import { FetchHeaders } from '../utils/fetch';

export type MapLayer = (AnyLayer | CustomLayerInterface) & {
  weight?: number;
  source: string;
};

export type RemoteServiceResponse = FeatureCollection & { nextCursor?: string };

export type LegacyLayer = {
  name: string;
  remote?: string;
  remoteService?: (
    tenant: string,
    headers?: FetchHeaders
  ) => Promise<RemoteServiceResponse>;
  local?: string;
  color: string;
  defaultOn: boolean;

  // which layer to show this before
  // used for layer display ordering
  weight?: number;

  alwaysOn?: boolean;
  searchable?: string;
  searchInputText?: string;
  mapLayers?: MapLayer[];
  asset?: {
    filter?: [string, string | string[]];
    displayField: string;
  };
};

export type Layer = ProjectConfigMapLayers;

export type Layers = Record<string, Layer>;

export interface DocumentConfig {
  disabled?: boolean;
  defaultLimit?: number;
  // This is used to decide whether extract documents by parent path field or directory field
  extractByFilepath?: boolean;
  filters?: DocumentFilter;
  wellboreSchematics?: {
    supportedFileTypes: Array<string>;
  };
  showGeometryOnMap?: boolean;
  mapLayerFilters?: MapLayerFilters;
}

export interface TrackConfig {
  name: TrackType;
  enabled: boolean;
}

export interface ChartDataConfig {
  x: string;
  y: string;
  z?: string;
}

export interface ChartVizDataConfig {
  axisNames: ChartDataConfig;
  title: string;
}

export interface ChartConfig {
  type: 'line' | '3d' | 'legend';
  chartData: ChartDataConfig;
  chartExtraData: { [Key: string]: any };
  chartVizData: ChartVizDataConfig;
}

export type SequenceFetcher = (
  client: CogniteClient,
  filters: any
) => Promise<Sequence[]>;

export interface TrajectoryColumns {
  name: string;
  externalId: string;
  valueType: string;
}

export interface WellConfig {
  disabled?: boolean;

  filters?: {
    parentExternalIds?: string | string[];
    source?: string | string[];
  };

  wellbores?: {
    fetch?: (client: CogniteClient, filters: any) => Promise<ListResponse<any>>;
  };

  overview?: {
    enabled: boolean;
  };
  ppfg?: {
    enabled: boolean;
    tvdColumn?: string;
    defaultCurves?: string[];
    fetch?: SequenceFetcher;
  };

  geomechanic?: {
    enabled: boolean;
    fetch?: SequenceFetcher;
  };

  trajectory?: {
    enabled: boolean;
    normalizeColumns?: Record<string, string>;
    columns?: TrajectoryColumns[];
    charts?: ChartConfig[];
    // queries?: SequenceFilter[]; // <- upgrade to this
    queries?: any[];
  };

  logs?: {
    enabled: boolean;
    types?: LogTypes[];
    queries?: SequenceFilter[];
    tracks?: TrackConfig[];
  };

  fit?: {
    enabled: boolean;
    fieldInfo?: { [key: string]: string };
    fetch?: SequenceFetcher;
  };

  lot?: {
    enabled: boolean;
    fieldInfo?: { [key: string]: string };
    fetch?: SequenceFetcher;
  };

  relatedDocument?: {
    enabled: boolean;
  };

  threeDee?: {
    enabled: boolean;
  };

  digitalRocks?: {
    enabled: boolean;
    metaInfo?: { [key: string]: string };
    fetch?: (client: CogniteClient, filters: any) => Promise<Asset[]>;
    digitalRockSampleFetch?: (
      client: CogniteClient,
      filters: any
    ) => Promise<Asset[]>;
    gpartFetch?: SequenceFetcher;
  };

  casing?: {
    enabled?: boolean;
    queries?: SdkSequenceFilter['filter'][];
  };

  nds?: {
    enabled?: boolean;
  };

  npt?: {
    enabled?: boolean;
  };

  measurements?: {
    enabled?: boolean;
  };

  nds_filter?: {
    enabled?: boolean;
  };

  npt_filter?: {
    enabled?: boolean;
  };

  data_source_filter?: {
    enabled?: boolean;
  };

  field_block_operator_filter?: {
    region?: {
      enabled?: boolean;
    };
    field?: {
      enabled?: boolean;
    };
    operator?: {
      enabled?: boolean;
    };
    block?: {
      enabled?: boolean;
    };
  };

  well_characteristics_filter?: {
    well_type?: {
      enabled?: boolean;
    };
    md?: {
      enabled?: boolean;
    };
    kb_elevation?: {
      enabled?: boolean;
    };
    tvd?: {
      enabled?: boolean;
    };
    dls?: {
      enabled?: boolean;
      feetDistanceInterval: number;
      meterDistanceInterval: number;
    };
    maximum_inclination_angle?: {
      enabled?: boolean;
    };
    spud_date?: {
      enabled?: boolean;
    };
    water_depth?: {
      enabled?: boolean;
    };
  };

  measurements_filter?: {
    enabled?: boolean;
  };
}

interface SeismicMetadataField {
  displayName: string;
  source?: string;
  display: boolean;
  width?: number;
}
export interface SeismicConfig {
  disabled?: boolean;
  // which metadata to display
  metadata?: Record<string, SeismicMetadataField>;
}

export interface MapConfig {
  zoom?: MapboxOptions['zoom'];
  center: MapboxOptions['center'];
  maxBounds?: MapboxOptions['maxBounds'];
  cluster?: boolean;
  seismic?: {
    zoom: MapboxOptions['zoom']; // deprecated
    center: MapboxOptions['center']; // deprecated
    maxBounds?: MapboxOptions['maxBounds']; // deprecated
  };
}

export enum AdminAuthMode {
  Firebase,
  Groups,
}

export interface AzureConfig {
  // this tenant has azure IdP <- note, we should not be concerned about this
  // but as a fast hack for now
  // we will use this to determine 'azure' only things, eg: admin roles
  enabled?: boolean;
  instrumentationKey?: string; // use Application Insights
  options?: AzureTelemetryOptions;
}

export interface FavoritesConfig {
  showDownloadAllDocumentsButton?: boolean;
}

export type ExternalLinksConfig = {
  [key: string]: (field?: string) => string;
};

export interface CompanyInfoConfig {
  name?: string;
  logo?: string; // The logo needs to be uploaded in the images/logo directory.
}

/**
 * The key value needs to be the layer ID to enable it for that layer.
 * The labelAccessor is also needed because that will be used as the Label of that filter
 * Example: { discoveries: { labelAccessor: "Discovery" }}
 * */
export interface MapLayerFilters {
  [key: string]: {
    labelAccessor: string;
    filters?: Array<keyof DocumentFilter>;
  };
}

type ModuleConfig = {
  [Modules.DOCUMENTS]?: DocumentConfig;
  [Modules.WELLS]?: WellConfig;
  [Modules.SEISMIC]?: SeismicConfig;
};

export interface TenantConfig extends ModuleConfig {
  sideBar?: number;
  searchableLayerTitle?: string;
  hideFilterCount?: boolean;
  showDynamicResultCount?: boolean;
  companyInfo?: CompanyInfoConfig;
  map?: MapConfig;
  azureConfig?: AzureConfig;
  favorites?: FavoritesConfig;
  externalLinks?: ExternalLinksConfig;
  showProjectConfig?: boolean;
}
