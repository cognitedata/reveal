/**
 * Created by phil on 5/12/20
 */

import { Metadata, WellMetadata } from "@/Solutions/BP/MetadataTransform";

/**
 * Overview
 * This is the interface for the Well object
 */
export type WellId = number;

export interface IWellMeta extends WellMetadata, Metadata {}

export interface IWell {
  externalId: string;
  name: string;
  parentId: number;
  parentExternalId: string;
  description: string;
  dataSetId: number;
  source: string;
  id: WellId;
  createdTime: string;
  lastUpdatedTime: string;
  rootId: number;
  metadata: IWellMeta;
}
