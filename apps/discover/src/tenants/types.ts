import { FeatureCollection } from '@turf/helpers';
import type {
  MapboxOptions,
  AnyLayer,
  CustomLayerInterface,
} from 'maplibre-gl';

import { AzureTelemetryOptions } from '@cognite/react-azure-telemetry';
import { Asset, CogniteClient, ListResponse, Sequence } from '@cognite/sdk';

import { Modules } from 'modules/sidebar/types';
import { SequenceFilter } from 'modules/wellSearch/service';
import { LogTypes, TrackType } from 'modules/wellSearch/types';

export type MapLayer = (AnyLayer | CustomLayerInterface) & {
  weight?: number;
  source: string;
};

export type RemoteServiceResponse = FeatureCollection & { nextCursor?: string };

export interface Layer {
  name: string;
  remote?: string;
  remoteService?: (
    tenant: string,
    cursor?: string
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
}

export type Layers = Record<string, Layer>;

export interface DocumentConfig {
  disabled?: boolean;
  defaultLimit?: number;
  // This is used to decide whether extract documents by parent path field or directory field
  extractByFilepath?: boolean;
  filters: {
    // [s: string]: string | string[] | number;
    [s: string]: any; // need to update to api types
  };
  wellboreSchematics?: {
    supportedFileTypes: Array<string>;
  };
  showGeometryOnMap?: boolean;
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

export interface WellConfig {
  disabled?: boolean;

  filters?: {
    [s: string]: string | string[];
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
    fetch?: (client: CogniteClient, filters: any) => Promise<Sequence[]>;
  };

  geomechanic?: {
    enabled: boolean;
    fetch?: (_client: CogniteClient, filters: any) => Promise<Sequence[]>;
  };

  trajectory?: {
    enabled: boolean;
    normalizeColumns?: Record<string, string>;
    columns?: any[];
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
    fetch?: (client: CogniteClient, filters: any) => Promise<Sequence[]>;
  };

  lot?: {
    enabled: boolean;
    fieldInfo?: { [key: string]: string };
    fetch?: (client: CogniteClient, filters: any) => Promise<Sequence[]>;
  };

  relatedDocument?: {
    enabled: boolean;
  };

  threeDee?: {
    enabled: boolean;
  };
  multiplePPFG?: {
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
    gpartFetch?: (client: CogniteClient, filters: any) => Promise<Sequence[]>;
  };

  // let's go random for now:
  [s: string]: any;
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
  seismic?: {
    zoom: MapboxOptions['zoom']; // deprecated
    center: MapboxOptions['center']; // deprecated
    maxBounds?: MapboxOptions['maxBounds']; // deprecated
  };
  cluster?: boolean;
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

type ModuleConfig = {
  [Modules.DOCUMENTS]?: DocumentConfig;
  [Modules.WELLS]?: WellConfig;
  [Modules.SEISMIC]?: SeismicConfig;
};

export interface TenantConfig extends ModuleConfig {
  sideBar?: number;
  searchableLayerTitle?: string;
  map?: MapConfig;
  companyInfo?: CompanyInfoConfig;
  externalLinks?: ExternalLinksConfig;
  azureConfig?: AzureConfig;
  hideFilterCount?: boolean;
  favorites?: FavoritesConfig;
  showDynamicResultCount?: boolean;
  showProjectConfig?: boolean;
}
