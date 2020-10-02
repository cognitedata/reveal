/* eslint-disable camelcase */
import React from 'react';

export interface DataTransferObject {
  [key: string]: any;
}

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
  source: {
    external_id: string;
    source: string;
  };
  target: {
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
  business_tags: string[];
  author: string;
  status_active?: boolean;
  datatypes: string[];
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
  render: (record: any) => React.ReactFragment;
}

export const UNIX_TIMESTAMP_FACTOR = 1000;
