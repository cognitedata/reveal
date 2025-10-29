/*!
 * Copyright 2025 Cognite AS
 */

import { FileInfo } from '@cognite/sdk';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { CdfImage360CollectionDmQuery } from './get360CdmCollectionsQuery';

/**
 * Common types for CDM-based 360 image descriptors.
 * These types are derived from the DMS query results and are used by the batch collection loader.
 */

// DMS query result type - using batch query structure
export type QueryResult = Awaited<
  ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<CdfImage360CollectionDmQuery>>
>;

// Image types
export type ImageResult = QueryResult['images'];
export type ImageInstanceResult = QueryResult['images'][number];
export type ImageResultProperties = ImageInstanceResult['properties']['cdf_cdm']['Cognite360Image/v1'];

// Collection types - batch query uses 'image_collections' (plural)
export type CollectionInstanceResult = QueryResult['image_collections'][number];

// File response type from CDM files API
export type CoreDmFileResponse = {
  data: {
    items: FileInfo[];
  };
};
