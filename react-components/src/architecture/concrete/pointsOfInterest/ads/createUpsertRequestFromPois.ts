import { DmsUniqueIdentifier } from '../../../../data-providers';
import { ExternalId } from '../../../../data-providers/FdmSDK';
import { VisibleState } from '../../../base/domainObjectsHelpers/VisibleState';
import {
  PointsOfInterestInstance,
  PointsOfInterestProperties,
  PoiVisibility,
  SceneState
} from '../models';
import { PointOfInterest } from '../types';

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
  pois: PointsOfInterestInstance<ExternalId>[]
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
