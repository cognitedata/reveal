/*!
 * Copyright 2024 Cognite AS
 */
import {
  Timeseries,
  type ExternalId,
  type InternalId,
  type Metadata,
  type Relationship
} from '@cognite/sdk/';
import { type DmsUniqueIdentifier, type Source } from './FdmSDK';

export type FdmInstanceWithView = DmsUniqueIdentifier & { view: Source };

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
