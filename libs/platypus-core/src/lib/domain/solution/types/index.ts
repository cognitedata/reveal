export interface Solution {
  id: string;
  name: string;
  description?: string;
  createdTime: number;
  updatedTime: number;
  owners: string[];
  version: string;
}

export enum SolutionSchemaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface SolutionSchema {
  externalId: string;
  status: SolutionSchemaStatus;
  version: string;
  /** GraphQL Schema String */
  schema: string;
  /**
   * When resource was created
   */
  createdTime: number;
  /**
   * When resource was last updated
   */
  lastUpdatedTime: number;
}
