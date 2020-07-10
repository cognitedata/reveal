/* eslint-disable camelcase */
export interface DataTransferObject {
  key?: string;
  id: number;
  name: string;
  externalId: string;
  dataType: string;
  author: string;
  repositoryProject: string;
  report: string;
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
