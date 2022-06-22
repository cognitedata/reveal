import { Router } from 'express';
import { LowdbSync } from 'lowdb';
import { Api } from './middlewares/schema/types';

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
  handler?: EndpointHandler;
}

export interface CdfApiConfig {
  version: number;
  urlRewrites?: {
    [routePattern: string]: string;
  };
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
