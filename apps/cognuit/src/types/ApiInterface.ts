/* eslint-disable camelcase */
// Following types derived from https://cognuit-cognitedata-development.cognite.ai/docs

// Data status tags
export type DataStatusResponse = string;

// Reference

export type DatatypesResponse = string;
export type SourcesResponse = string;

// Connectors

export type ConnectorInstance = {
  source: string;
  instance: string;
};
export type HeartbeatsResponse = number[];

type timestamp = number;
export type HeartbeatsReportResponse = {
  // Default 7 weeks with aggregates, take x latest items for 24h status
  aggregates: {
    [ts: timestamp]: boolean;
  };
  connector: {
    source: string;
    instance: string;
  };
  latest_heartbeat: timestamp;
  online: boolean;
  outages: [timestamp, timestamp][];
};

// Projects
export type BusinessTagsResponse = string[];
export type ProjectResponse = {
  id: number;
  external_id: string;
  source: string;
  instance: string;
};

export type RepositoryTreeResponse = {
  name: string;
  external_id: string;
  cdf_metadata?: any;
  business_tags: string[];
  children: any[];
};

// Configurations
export type ConfigurationResponse = {
  id: number;
  source: Source;
  target: Source;
  business_tags: string[];
  author: string;
  datatypes: any[];
  data_status: string[];
  name: string;
  ow_to_studio_config?: OwToStudioConfig;
  created_time: number;
  last_updated: number;
  status_active: boolean;
  progress: Progress;
};

interface Progress {
  [key: string]: AdditionalProp;
}

interface AdditionalProp {
  in_progress: number;
  outdated: number;
  not_uploaded: number;
  succeeded: number;
  new: number;
  total: number;
}

interface OwToStudioConfig {
  folder: string;
  session_name: string;
  tag_name: string;
}

export interface Source {
  external_id: string;
  source: string;
  instance?: string;
}

export type Status = 'In progress' | 'Succeeded' | 'Failed';

// Data transfers

export interface DataTransferResponse {
  source: ObjectGetResponse;
  target: ObjectGetResponse;
  status: Status;
}

// Object revisions

export interface RevisionTranslationsResponse {
  id: number;
  created_time: number;
  last_updated: number;
  object_id: number;
  revision: string;
  cdf_file: CdfFile;
  status: string;
  steps: Step[];
  translations: Translation[];
}

interface Translation {
  revision: string;
  status: string;
}

export interface ObjectGetResponse {
  id: number;
  created_time: number;
  last_updated: number;
  datatype: string;
  name: string;
  crs: string;
  cdf_metadata: any;
  business_tags: string[];
  data_status: string[];
  origin: string;
  project: ProjectResponse;
  package: Package | null;
  revisions: Revision[];
  external_id: string;
  source_created_time: number | null;
  source_last_updated: number | null;
  author: string | null;
  grouping: string | null;
  source_object_id: number | null;
  revisions_count: number;
}

export interface Revision {
  id: number;
  created_time: number;
  last_updated: number;
  object_id: number;
  revision: string;
  cdf_file?: CdfFile;
  status?: string;
  steps: Step[];
  translations:
    | {
        revision: Revision;
        status: string;
      }[]
    | null;
}

export interface Step {
  status: string;
  error_message: string | null;
  created_time: number;
}

interface CdfFile {
  id?: number;
  upload_link?: string;
  uploaded?: boolean;
}

interface Package {
  id: number;
  created_time: number;
  last_updated: number;
  name: string;
  external_id: string;
  cdf_metadata: CdfMetadata;
  business_tags: string[];
  project: ProjectResponse;
  parent: string;
  actively_monitored: boolean;
  path: string;
  active: boolean;
}

interface CdfMetadata {
  [key: string]: string;
}
