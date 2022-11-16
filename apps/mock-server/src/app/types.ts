import { Router } from 'express';
import { LowdbSync } from 'lowdb';
import { Api } from './middlewares/data-modeling/types';

export type FilterMode = 'list' | 'byids' | 'filter' | 'search';

export interface KeyValuePair {
  [key: string]: unknown;
}
export interface CdfResourceObject extends KeyValuePair {
  id?: string | number;
  externalId?: string | number;
  metadata?: Record<string, unknown>;
  source?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
}

export interface TemplateGroup {
  id?: number | string;
  externalId: string;
  description: string;
  owners: string[];
  createdTime: number;
  lastUpdatedTime: number;
}

export interface TemplateGroupTemplate {
  id?: number | string;
  version: number;
  schema: string;
  createdTime: number;
  lastUpdatedTime: number;
  templategroups_id?: number | string;
  db?: MockData; // the template version tables and storage
}

export type MockData = {
  [name: string]: CdfResourceObject[];
} & {
  assets?: CdfResourceObject[];
  datasets?: CdfResourceObject[];
  events?: CdfResourceObject[];
  templategroups?: TemplateGroup[];
  templates?: TemplateGroupTemplate[];
  schema?: Api[];
};

export interface CdfApiEndpointFilterConfig {
  /** Should this filter be skipped */
  ignore?: boolean;
  /** Internal property name that you want to map. ex parentExternalIds -> parentExternalId */
  rewrite?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EndpointHandler = (db: CdfMockDatabase, req, res) => void;
export interface CdfApiEndpointConfig {
  /** Configure any overrides for filters, like filter name, data...etc. */
  filters?: {
    [filterName: string]: CdfApiEndpointFilterConfig;
  };
  /** Use if you want to completley override the endpoint */
  handler?: EndpointHandler;
  /** Use it to transform the request */
  requestTransformer?: EndpointHandler;
}

export interface CdfApiConfig {
  /** Used to generate generic CDF Like Api handlers */
  defaultApiEndpoints?: string[];
  /** Used for templates/graphql APIs for types like timeseries...etc */
  builtInTypes?: { [typeName: string]: string };
  /** The default endpoint endings for CDF APIs ex: /list, /search, /byids...etc */
  whitelistedEndpointEndings?: string[];
  /** If url match this pattern the mock server will not process it and you can have custom handling */
  ignoreUrlPatterns?: string[];
  version?: number;
  /** Used to map CDF API path to JSON Server */
  urlRewrites?: {
    [routePattern: string]: string;
  };
  /** Custom handling for this routes */
  endpoints?: {
    [endpoint: string]: CdfApiEndpointConfig;
  };
}

export type CdfMockDatabase = LowdbSync<MockData>;
export interface ExtendedRouter extends Router {
  db: KeyValuePair;
  init?: (mockData?: CdfMockDatabase) => void;
}
export interface CdfServerRouter extends Router {
  db: CdfMockDatabase;
  reset?: (mockData: CdfMockDatabase) => void;
}

export interface DatapointGroup {
  timestamp: number;
  datapoints: Datapoint[];
}

export interface Datapoint {
  timestamp: number;
  value: number;
  stringValue?: string;
  __typename?: string;
}
