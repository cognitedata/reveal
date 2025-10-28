/*!
 * Copyright 2025 Cognite AS
 */

import { FileInfo } from '@cognite/sdk';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { Cdf360FdmQuery } from './get360CdmCollectionQuery';

/**
 * Common types for CDM-based 360 image descriptors.
 * These types are derived from the DMS query results and are shared between
 * the single collection provider and the batch collection loader.
 */

// DMS query result type
export type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<Cdf360FdmQuery>>>;

// Image types
export type ImageResult = QueryResult['images'];
export type ImageInstanceResult = QueryResult['images'][number];
export type ImageResultProperties = ImageInstanceResult['properties']['cdf_cdm']['Cognite360Image/v1'];

// Collection types
export type CollectionInstanceResult = QueryResult['image_collection'][number];

// File response type from CDM files API
export type CoreDmFileResponse = {
  data: {
    items: FileInfo[];
  };
};
