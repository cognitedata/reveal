/**
 * Created by phil on 5/12/20
 */

import { Metadata, WellboreMetadata } from 'Solutions/BP/MetadataTransform';

/**
 * Overview
 * This is the interface for the Well bore object
 */
export type WellBoreId = string;

export interface IWellBoreMeta extends WellboreMetadata, Metadata {}

export interface IWellBore {
  externalId: string;
  name: string;
  parentId: string;
  parentExternalId: string;
  description: string;
  dataSetId: number;
  source: string;
  id: WellBoreId;
  createdTime: string;
  lastUpdatedTime: string;
  rootId: number;
  metadata: IWellBoreMeta;
}
