/*!
 * Copyright 2024 Cognite AS
 */
import { type DmsUniqueIdentifier } from '../../../../data-providers';
import { type Space, type ExternalId } from '../../../../data-providers/FdmSDK';

export type PoiExternalAssetRef = { id: number };
export type PoiExternalDMRef = { externalId: ExternalId; instanceSpace: Space };
export type PoiExternalInstanceRef = PoiExternalAssetRef | PoiExternalDMRef;

export type PoiUpsertRequestPayload = {
  externalId: ExternalId;
  name: string;
  description?: string;
  position: Vec3;
  sceneState: PoiSceneState;
  screenshotFile: number;
  scene: DmsUniqueIdentifier;
  assetRef: PoiExternalInstanceRef;
  visibility: PoiVisibility;
};

export type PoiItem = {
  externalId: ExternalId;
  ownerId: string;
  name: string;
  description?: string;
  position: Vec3;
  scene?: DmsUniqueIdentifier;
  sceneState: PoiSceneState;
  assetRef?: PoiExternalInstanceRef;
  visibility: PoiVisibility;
  createdTime: number;
  lastUpdatedTime: number;
};

export type PoiSceneState = {
  slicingPlanes?: PoiSlicingPlane[];
  cameraPosition?: Vec3;
  cameraTarget?: Vec3;
};

export type Vec3 = [number, number, number];

/**
 * A plane in three dimensions consisting of all poinst satisfying the equation a * x + b * y + c * z + d = 0
 * The inside of the plane (the area that are kept visible) is the points where a * x + b * y + c * z + d > 0,
 * while points giving a * x + b * y + c * z + d < 0 are invisible if the clipping plane is active
 */
export type PoiSlicingPlane = {
  a: number;
  b: number;
  c: number;
  d: number;
};

export enum PoiVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}
