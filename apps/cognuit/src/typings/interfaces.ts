/* eslint-disable camelcase */
import React from 'react';

import { ConfigurationsResponse } from '../types/ApiInterface';

// Goal: Remove this interface
export interface DataTransferObject {
  [key: string]: any;
}

// Goal: Remove this interface
export interface GenericResponseObject {
  [key: string]: any;
}

export interface RevisionObject {
  id: number;
  created_time: number;
  last_updated: number;
  object_id: number;
  cdf_file?: {
    id?: 0;
    upload_link?: string;
    uploaded?: boolean;
  };
  status?: string;
  steps: {
    status: string;
    error_message: string;
    created_time: number;
  }[];
  revision: any;
  translations: RevisionObject[];
  cdf_metadata: any;
}

export interface RESTProject {
  created_time: number;
  external_id: string;
  id: number;
  last_updated: number;
  source: string;
}

export interface RESTPackageFilter {
  source: string;
  project: string;
  external_id?: string;
  name?: string;
  last_updated?: number;
  created_time?: number;
  [property: string]: any;
}

export interface RESTObjectsFilter {
  connector: string;
  project?: string;
  configuration?: string;
  [property: string]: any;
}

export interface RESTConfigurationsFilter {
  source: {
    external_id?: string;
    source: string;
  };
  target: {
    external_id?: string;
    source: string;
  };
  datatypes?: string[];
  [property: string]: any;
}

export type SelectedDateRangeType = [Date | null, Date | null];
export interface RESTTransfersFilter {
  source?: {
    external_id: string;
    source: string;
  };
  target?: {
    external_id: string;
    source: string;
  };
  updated_after?: number;
  updated_before?: number;
  configuration?: string;
  datatype?: string;
  [property: string]: any;
}

export enum Source {
  STUDIO = 'Studio',
  OPENWORKS = 'Openworks',
  EDM = 'EDM',
}

export interface Configuration {
  id?: string;
  created_time?: string;
  last_updated?: string;
  name: string | null | undefined;
  source: {
    external_id: string;
    source: Source;
  };
  target: {
    external_id: string;
    source: Source;
  };
  business_tags?: string[];
  author: string;
  status_active?: boolean;
  datatypes: string[];
}

export interface ConfigurationOWtoPS {
  source: {
    external_id: string;
    source: Source;
  };
  target: {
    external_id: string;
    source: Source;
  };
  author: string;
  name: string | null | undefined;
  well_plan: number[];
  targets: number[];
  ow_to_studio_config: {
    folder?: string | null | undefined;
    session_name?: string | null | undefined;
    tag_name?: string | null | undefined;
  };
}

export enum SessionType {
  PS_TO_OW = 'ps-to-ow',
  OW_TO_PS = 'ow-to-ps',
}

export enum DummyUser {
  DEMO = 'Demo User',
}
export interface Rule {
  key: string;
  render: ({ value }: { value: any }) => React.ReactFragment;
  disableSortBy?: boolean;
}

export interface ErrorDistributionObject extends GenericResponseObject {
  name: string;
  total_errors: number;
}

export interface TranslationStatisticsObject {
  timestamp: number;
  total_objects: number;
  successful: number;
}

export const UNIX_TIMESTAMP_FACTOR = 1000;

/**
 * For some reason the properties are extended in
 * "curateConfigurationsData"
 */
export interface ExtendedConfigurationsResponse extends ConfigurationsResponse {
  statusColor: ConfigurationsResponse['status_active'];
  repoProject: string;
  actions: {
    direction: ConfigurationsResponse['source']['source'];
    statusActive: ConfigurationsResponse['status_active'];
    id: ConfigurationsResponse['id'];
    name: ConfigurationsResponse['name'];
  };
  conf_name: {
    name: ConfigurationsResponse['name'];
    id: ConfigurationsResponse['id'];
  };
}

export interface GenerateConfigurationsColumns {
  title: string;
  dataIndex: string;
  key: string;
  sorter: ((a: any, b: any) => number) | boolean;
}
