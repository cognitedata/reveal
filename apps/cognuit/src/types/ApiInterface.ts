/* eslint-disable camelcase */
// Following types derived from https://cognuit-cognitedata-development.cognite.ai/docs

export type ErrorDistributionResponse = {
  name: string;
  total_errors: number;
};

// Data types
export type DatatypesResponse = string[];

// Sources
export type SourcesResponse = string[];
export type SourcesHeartbeatsResponse = number[];

// Projects
export type ProjectBusinessTagsResponse = string[];
export type ProjectsResponse = {
  id: number;
  created_time: number;
  last_updated: number;
  external_id: string;
  source: string;
  connector_instances: string[];
};

export type ProjectRepositoryTheeResponse = {
  name: string;
  external_id: string;
  cdf_metadata?: any;
  business_tags: string[];
  children: any[];
};

// Configurations
export type ConfigurationsResponse = {
  id: number;
  source: Source;
  target: Source;
  business_tags: any[];
  author: string;
  datatypes: any[];
  data_status: any[];
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

interface Source {
  external_id: string;
  source: string;
}

// Data transfers
export interface DataTransfersResponse {
  source: ObjectsRevisionsResponse;
  target: ObjectsRevisionsResponse;
  status: string;
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

interface Step {
  status: string;
  error_message: string;
  created_time: number;
}

export interface ObjectsRevisionsResponse {
  id: number;
  created_time: number;
  last_updated: number;
  datatype: string;
  connector: string;
  name: string;
  crs: string;
  cdf_metadata: any;
  business_tags: any[];
  data_status: any[];
  origin: string;
  project: string;
  package: Package;
  revisions: Revision[];
  external_id: string;
  source_created_time: number;
  source_last_updated: number;
  author: string;
  source_object_id: number;
  revisions_count: number;
}

interface Revision {
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

interface Step {
  status: string;
  error_message: string;
  created_time: number;
}

interface CdfFile {
  id: number;
  upload_link: string;
  uploaded: boolean;
}

interface Package {
  id: number;
  created_time: number;
  last_updated: number;
  name: string;
  external_id: string;
  cdf_metadata: CdfMetadata;
  business_tags: string[];
  source: string;
  project: string;
  parent: string;
  actively_monitored: boolean;
  path: string;
  active: boolean;
}

interface CdfMetadata {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}
