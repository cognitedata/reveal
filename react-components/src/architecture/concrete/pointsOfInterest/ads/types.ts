/*!
 * Copyright 2024 Cognite AS
 */
import { type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../../../data-providers';
import { type Space, type ExternalId } from '../../../../data-providers/FdmSDK';

export type PoIUpsertRequestPayload = {
  externalId: ExternalId;
  name: string;
  description?: string;
  position: Vec3;
  sceneState: PoISceneState;
  screenshotFile: InternalId;
  scene: DmsUniqueIdentifier;
  assetRef: { id: InternalId } | DmsUniqueIdentifier;
  visibility: PoIVisibility;
};

export type PoIItem = {
  externalId: ExternalId;
  ownerId: string;
  name: string;
  description?: string;
  position: Vec3;
  sceneExternalId?: ExternalId;
  sceneSpace?: Space;
  sceneState: PoISceneState;
  assetRef: DmsUniqueIdentifier;
  visibility: PoIVisibility;
  createdTime: number;
  lastUpdatedTime: number;
};

export type PoISceneState = {
  slicingPlanes?: PoISlicingPlane[];
  cameraPosition?: Vec3;
  cameraTarget?: Vec3;
};

export type Vec3 = [number, number, number];

/**
 * A plane in three dimensions consisting of all poinst satisfying the equation a * x + b * y + c * z + d = 0
 * The inside of the plane (the area that are kept visible) is the points where a * x + b * y + c * z + d > 0,
 * while points giving a * x + b * y + c * z + d < 0 are invisible if the clipping plane is active
 */
export type PoISlicingPlane = {
  a: number;
  b: number;
  c: number;
  d: number;
};

export enum PoIVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}
