/*!
 * Copyright 2024 Cognite AS
 */
import {
  type Datapoints,
  type Timeseries,
  type ExternalId,
  type InternalId,
  type Metadata,
  type Relationship,
  type Node3D
} from '@cognite/sdk/';
import { type NodeItem, type DmsUniqueIdentifier, type Source, type EdgeItem } from './FdmSDK';
import { type FdmCadConnection } from '../components/CacheProvider/types';
import { type FdmPropertyType } from '../components/Reveal3DResources/types';

export type FdmInstanceWithView = DmsUniqueIdentifier & { view: Source };

export type FdmInstanceWithProperties = NodeItem<unknown> | EdgeItem<unknown>;

export type FdmInstanceNodeWithConnectionAndProperties = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  deletedTime: number;
  properties: FdmPropertyType<unknown>;
  connection?: FdmCadConnection | undefined;
  cadNode?: Node3D | undefined;
  view?: Source | undefined;
};

export type AssetInstanceReference = { assetId: number };
export type InstanceReference = AssetInstanceReference | DmsUniqueIdentifier;

export function isAssetInstance(instance: InstanceReference): instance is AssetInstanceReference {
  return 'assetId' in instance;
}

export function isDmsInstance(instance: InstanceReference): instance is DmsUniqueIdentifier {
  return 'externalId' in instance && 'space' in instance;
}

export type RelationshipsFilterInternal = {
  labels?: string[];
};

export type ExtendedRelationship = {
  relation: 'Source' | 'Target';
} & Relationship;

export type RelationshipSourceAndTarget = {
  source: RelationshipSourceAndTargetData;
  target: RelationshipSourceAndTargetData;
};
export type RelationshipSourceAndTargetData = {
  externalId?: string;
  id?: number;
  metadata?: Metadata;
};

export type RelationshipData = ExtendedRelationship & RelationshipSourceAndTarget;

export type AssetIdsAndTimeseries = {
  assetIds?: Partial<ExternalId & InternalId>;
  timeseries?: Timeseries | undefined;
};

export type AssetAndTimeseriesIds = {
  assetIds: Partial<ExternalId & InternalId>;
  timeseriesIds: Partial<ExternalId & InternalId>;
};

export type AssetIdsAndTimeseriesData = {
  assetIdsWithTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[];
};
