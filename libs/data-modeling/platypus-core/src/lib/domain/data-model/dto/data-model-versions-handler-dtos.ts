import { DataModelVersion, DataModelVersionStatus } from '../types';

export interface FetchDataModelVersionDTO {
  /** Data Model externalId */
  externalId: string;
  space: string;
  version: string;
}

export interface ListDataModelVersionsDTO {
  /** Data Model externalId */
  externalId: string;
  space?: string;
  version?: string;
}

export interface CreateDataModelVersionDTO {
  /** Data Model externalId */
  externalId: string;
  space?: string;

  /** GraphQL schema as string */
  schema: string;
  version?: string;
  previousVersion?: string;
  /**
   * When resource was created
   */
  createdTime?: number;
  /**
   * When resource was last updated
   */
  lastUpdatedTime?: number;
  status?: DataModelVersionStatus;
  /**
   * Carried over from data model (each one should follow the first one created)
   */
  name?: string;
  description?: string;
}

export interface PublishDataModelVersionDTO
  extends Omit<DataModelVersion, 'views'> {
  previousVersion?: string;
}
