/* eslint-disable @typescript-eslint/no-empty-interface */
/**
 * Data transfer objects (DTO) for Data Model Storage API
 */

import { DataModelStorageModel, DmsModelProperty } from '../types';

interface BaseDTOWithExternalIdItems {
  items: {
    externalId: string;
  }[];
}
interface BaseDTOWithKeyValuePairsItems {
  /**
   * The data that needs to be ingested as key->value pairs
   */
  items: {
    [key: string]: string | number | boolean;
  }[];
}
interface BaseDTOWithModelProps {
  modelProperties: {
    [propertyName: string]: DmsModelProperty;
  };
}

interface BaseFilterableDTO {
  /**
   * A reference to a model. Consists of an array of spaceExternalId and modelExternalId.
   * May also just reference [ edge ] or [ node ], which don't belong to any particular space.
   */
  model: string[];
  /**
   * Limits the number of results to return.
   */
  limit?: number;
  /**
   * https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listEdges
   * Check the docs here :)
   */
  filter: any;
  /** Sort edges */
  sort?: {
    /** A reference to a property. Consists of an array of spaceExternalId, modelExternalId, and property name.
     * May also just reference [ edge, propName ] or [ node, propName ], which don't belong to any particular space. */
    property: string[];
    direction?: 'ascending' | 'descending';
    nullsFirst?: boolean;
  }[];
  /** Use it for pagination */
  cursor?: string;
}

/************* Models APIs DTOs **************/
/**
 * List models for a project
 */
export interface DmsListModelsRequestDTO {
  spaceExternalId: string;
}

export interface DataModelStorageModelsDTO {
  spaceExternalId: string;
  items: DataModelStorageModel[];
}
export interface DmsDeleteDataModelRequestDTO
  extends BaseDTOWithExternalIdItems {
  spaceExternalId: string;
}
/************* Models APIs DTOs **************/

/************* Nodes APIs DTOs **************/
export interface DmsIngestNodesRequestDTO
  extends BaseDTOWithKeyValuePairsItems {
  /**
   * The space to ingest the nodes into.
   */
  spaceExternalId: string;
  /**
   * A reference to a model. Consists of an array of spaceExternalId and modelExternalId.
   * May also just reference [ edge ] or [ node ], which don't belong to any particular space.
   */
  model: string[];
  /**
   * If overwrite is enabled, the items in the bulk will completely overwrite existing data.
   * The default is disabled, which means patch updates will be used: only specified keys will be overwritten.
   * With overwrite, missing items keys will null out existing data – assuming the columns are nullable.
   */
  overwrite?: boolean;
}

export interface FilterNodesRequestDTO extends BaseFilterableDTO {}
export interface FilterNodesResponseDTO
  extends BaseDTOWithKeyValuePairsItems,
    BaseDTOWithModelProps {
  nextCursor?: string;
}

export interface DmsIngestNodesResponseDTO
  extends BaseDTOWithKeyValuePairsItems,
    BaseDTOWithModelProps {}

export interface DmsDeleteNodesRequestDTO extends BaseDTOWithExternalIdItems {}
/************* Nodes APIs DTOs **************/

/************* Edges APIs DTOs **************/
export interface DmsIngestEdgesRequestDTO
  extends BaseDTOWithKeyValuePairsItems {
  spaceExternalId: string;
  /**
   * A reference to a model. Consists of an array of spaceExternalId and modelExternalId.
   * May also just reference [ edge ] or [ node ], which don't belong to any particular space.
   */
  model: string[];
  autoCreateStartNodes?: boolean;
  autoCreateEndNodes?: boolean;
  overwrite?: boolean;
}

// Will keep it just for name ref
export interface DmsDeleteEdgesRequestDTO extends BaseDTOWithExternalIdItems {}

// Will keep it just for name ref
export interface DmsIngestEdgesResponseDTO
  extends BaseDTOWithKeyValuePairsItems,
    BaseDTOWithModelProps {}

export interface RetrieveEdgesByIdsRequestDTO
  extends BaseDTOWithExternalIdItems {
  /**
   * A reference to a model. Consists of an array of spaceExternalId and modelExternalId.
   * May also just reference [ edge ] or [ node ], which don't belong to any particular space.
   */
  model: string[];
}

// Will keep it just for name ref
export interface RetrieveEdgesByIdsResponseDTO
  extends BaseDTOWithKeyValuePairsItems,
    BaseDTOWithModelProps {}

export interface FilterEdgesRequestDTO extends BaseFilterableDTO {}

export interface FilterEdgesResponseDTO
  extends BaseDTOWithKeyValuePairsItems,
    BaseDTOWithModelProps {
  nextCursor?: string;
}
/************* Edges APIs DTOs **************/

export interface DataModelSpaceDTO {
  externalId: string;
}
