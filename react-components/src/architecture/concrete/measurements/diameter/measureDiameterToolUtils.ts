// eslint-disable-next-line prettier/prettier
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { MeasureCylinderDomainObject } from '../MeasureCylinderDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { MeasureDiameterDomainObject } from './MeasureDiameterDomainObject';
import {
  CircleMarkerDomainObject,
  getCircleMarker,
  getOrCreateCircleMarker
} from '../../circleMarker/CircleMarkerDomainObject';
import { isPointCloudIntersection } from '../../reveal/pointCloud/isPointCloudIntersection';
import { getBestFitCylinderByIntersection } from './getBestFitCylinderByIntersection';
import { type MeasurementTool } from '../MeasurementTool';
import { type Vector3 } from 'three';

export async function updateMarker(tool: MeasurementTool, event: PointerEvent): Promise<boolean> {
  const intersection = await tool.getIntersection(event, intersectionPredicate);
  if (!isPointCloudIntersection(intersection)) {
    const circleMarker = getCircleMarker(tool.rootDomainObject);
    circleMarker?.setVisibleInteractive(false);
    return false;
  }
  const circleMarker = getOrCreateCircleMarker(tool.rootDomainObject);
  circleMarker.position.copy(intersection.point);
  circleMarker.notify(Changes.geometry);
  circleMarker.setDefaultColor();
  circleMarker.setVisibleInteractive(true);
  return true;
}

export async function updateMeasureDiameter(
  tool: MeasurementTool,
  cameraPosition: Vector3,
  event: PointerEvent
): Promise<boolean> {
  const intersection = await tool.getIntersection(event, intersectionPredicate);
  if (!isPointCloudIntersection(intersection)) {
    return false;
  }
  const root = tool.rootDomainObject;
  const circleMarker = getOrCreateCircleMarker(root);
  const bestFitCylinder = getBestFitCylinderByIntersection(
    intersection,
    cameraPosition,
    circleMarker.radius
  );
  if (bestFitCylinder === undefined) {
    circleMarker.position.copy(intersection.point);
    circleMarker.setWarningColor();
    circleMarker.setVisibleInteractive(true);
    return true;
  }
  const measureDiameter = getOrCreateMeasureDiameter(tool);
  const { cylinder } = measureDiameter;
  bestFitCylinder.copyTo(cylinder);
  cylinder.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

  circleMarker.setVisibleInteractive(false);
  measureDiameter.notify(Changes.geometry);
  // measureDiameter.setFocusInteractive(FocusType.Body);
  measureDiameter.setSelectedInteractive(true);
  measureDiameter.setVisibleInteractive(true);
  return true;
}

function intersectionPredicate(domainObject: DomainObject): boolean {
  return !(
    domainObject instanceof MeasureCylinderDomainObject ||
    domainObject instanceof CircleMarkerDomainObject
  );
}

function getMeasureDiameter(root: DomainObject): MeasureDiameterDomainObject | undefined {
  return root.getDescendantByType(MeasureDiameterDomainObject);
}

function getOrCreateMeasureDiameter(tool: MeasurementTool): MeasureDiameterDomainObject {
  let domainObject = getMeasureDiameter(tool.rootDomainObject);
  if (domainObject === undefined) {
    const parent = tool.getOrCreateParent();
    domainObject = new MeasureDiameterDomainObject();
    parent.addChildInteractive(domainObject);
  }
  return domainObject;
}
