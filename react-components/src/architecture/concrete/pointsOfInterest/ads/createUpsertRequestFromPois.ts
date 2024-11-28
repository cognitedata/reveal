/*!
 * Copyright 2024 Cognite AS
 */
import { type DmsUniqueIdentifier } from '../../../../data-providers';
import { type ExternalId } from '../../../../data-providers/FdmSDK';
import { type PointsOfInterestInstance, type PoiVisibility, type SceneState } from '../models';

type PoiUpsertObject = {
  externalId: ExternalId;
  name: string;
  position: [number, number, number];
  sceneState: SceneState;
  scene: DmsUniqueIdentifier;
  visibility: PoiVisibility;
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
      visibility: poi.visibility ?? 'PRIVATE'
    }))
  };
}
