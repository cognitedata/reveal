/* eslint-disable camelcase */
export interface DataTransferObject {
  [key: string]: any;
}

export interface GenericResponseObject {
  [key: string]: any;
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
  ANONYMOUS = 'Anonymous User',
  ERLAND = 'Erland Glad Solstrand',
  DEMO = 'Demo User',
}
