/* eslint-disable camelcase */
import { AllIconTypes } from '@cognite/cogs.js';
import React from 'react';

import {
  ConfigurationResponse,
  ConnectorInstance,
  Source as APISource,
} from '../types/ApiInterface';

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

export interface Project {
  id?: number;
  external_id: string;
  instance: string;
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
  source?: string;
  connector?: ConnectorInstance;
  project?: Project;
  configuration?: string;
  [property: string]: any;
}

export interface RESTConfigurationsFilter {
  source?: Project;
  target?: Project;
  datatypes?: string[];
  [property: string]: any;
}

export type SelectedDateRangeType = [Date | null, Date | null];
export interface RESTTransfersFilter {
  source?: Project;
  target?: Project;
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

export interface NewConfiguration {
  name: string | null;
  author: string;
  source: Project;
  target: Project;
  business_tags: string[];
  datatypes: string[];
  data_status: string[];
}

export interface ConfigurationOWtoPS {
  source: Project;
  target: Project;
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
  key: string | string[];
  render: (props: any) => React.ReactFragment;
  disableSortBy?: boolean;
  Filter?: (props: any) => JSX.Element;
  filter?: string;
  width?: number;
  filterIcon?: AllIconTypes;
}

export interface ErrorDistributionObject {
  name: string;
  total_errors: number;
}

export interface TranslationStatisticsObject {
  timestamp: number;
  total_objects: number;
  successful: number;
}

/**
 * For some reason the properties are extended in
 * "curateConfigurationsData"
 */
export interface ExtendedConfigurationsResponse extends ConfigurationResponse {
  statusColor: ConfigurationResponse['status_active'];
  sourceProject: APISource;
  targetProject: APISource;
  actions: {
    direction: ConfigurationResponse['source']['source'];
    statusActive: ConfigurationResponse['status_active'];
    id: ConfigurationResponse['id'];
    name: ConfigurationResponse['name'];
  };
  conf_name: {
    name: ConfigurationResponse['name'];
    id: ConfigurationResponse['id'];
  };
}

export interface GenerateConfigurationsColumns {
  title: string;
  dataIndex: string;
  key: string;
  sorter: ((a: any, b: any) => number) | boolean;
}
