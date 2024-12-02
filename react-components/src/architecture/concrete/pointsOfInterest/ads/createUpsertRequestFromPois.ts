/*!
 * Copyright 2024 Cognite AS
 */
import { InstanceReference, type DmsUniqueIdentifier } from '../../../../data-providers';
import { type ExternalId } from '../../../../data-providers/FdmSDK';
import { isAssetInstance } from '../../../../data-providers/types';
import { type PointsOfInterestInstance, type PoiVisibility, type SceneState } from '../models';
import { PoiExternalInstanceRef } from './types';

type PoiUpsertObject = {
  externalId: ExternalId;
  name: string;
  position: [number, number, number];
  sceneState: SceneState;
  scene: DmsUniqueIdentifier;
  visibility: PoiVisibility;
  assetRef?: PoiExternalInstanceRef;
};

type PoiUpsertRequest = {
  items: PoiUpsertObject[];
};

export function createUpsertRequestFromPois(
  pois: Array<PointsOfInterestInstance<ExternalId>>
): PoiUpsertRequest {
  return {
    items: pois.map(({ id, properties: poi }) => ({
      externalId: id,
      name: poi.title,
      position: [poi.positionX, poi.positionY, poi.positionZ],
      sceneState: {},
      scene: poi.scene,
      visibility: poi.visibility ?? 'PRIVATE',
      assetRef: instanceReferenceToPoiExternalInstanceReference(poi.instanceRef)
    }))
  };
}

function instanceReferenceToPoiExternalInstanceReference(
  instanceRef: InstanceReference | undefined
): PoiExternalInstanceRef | undefined {
  if (instanceRef === undefined) {
    return undefined;
  }

  if (isAssetInstance(instanceRef)) {
    return { id: instanceRef.assetId };
  } else {
    return { externalId: instanceRef.externalId, instanceSpace: instanceRef.space };
  }
}
