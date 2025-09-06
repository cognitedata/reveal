// eslint-disable-next-line prettier/prettier
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { MeasureCylinderDomainObject } from '../MeasureCylinderDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { MeasureRadiusDomainObject } from '../MeasureRadiusDomainObject';
import { type LeastSquareCylinderResult } from '../../../base/utilities/cylinderFit/LeastSquareCylinderResult';
import {
  CircleMarkerDomainObject,
  getCircleMarker,
  getOrCreateCircleMarker
} from '../../circleMarker/CircleMarkerDomainObject';
import { isPointCloudIntersection } from '../../reveal/pointCloud/isPointCloudIntersection';
import { getBestFitCylinder } from './getBestFitCylinder';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { type MeasurementTool } from '../MeasurementTool';

export async function updateMarker(tool: MeasurementTool, event: PointerEvent): Promise<boolean> {
  const intersection = await tool.getIntersection(event, intersectionPredicate);
  if (!isPointCloudIntersection(intersection)) {
    const circleMarker = getCircleMarker(tool.rootDomainObject);
    circleMarker?.setVisibleInteractive(false);
    return false;
  }
  const circleMarker = getOrCreateCircleMarker(tool.rootDomainObject);
  const point = intersection.point;
  circleMarker.position.copy(point);
  circleMarker.notify(Changes.geometry);
  circleMarker.setDefaultColor();
  circleMarker.setVisibleInteractive(true);
  return true;
}

export async function updateMeasureRadius(
  tool: MeasurementTool,
  event: PointerEvent
): Promise<boolean> {
  const intersection = await tool.getIntersection(event, intersectionPredicate);
  if (!isPointCloudIntersection(intersection)) {
    return false;
  }
  const root = tool.rootDomainObject;
  if (root === undefined) {
    return false;
  }
  const circleMarker = getOrCreateCircleMarker(root);
  const bestFitCylinder = getBestFitCylinder(
    tool.renderTarget.camera.position,
    circleMarker.radius,
    intersection
  );
  if (bestFitCylinder === undefined) {
    circleMarker.setWarningColor();
    circleMarker.setVisibleInteractive(true);
    return true;
  }
  const measureRadius = getOrCreateMeasureRadius(tool);
  copyBestFitCylinder(measureRadius, bestFitCylinder);

  circleMarker.setVisibleInteractive(false);
  measureRadius.notify(Changes.geometry);
  measureRadius.setFocusInteractive(FocusType.Body);
  measureRadius.setSelectedInteractive(true);
  measureRadius.setVisibleInteractive(true);
  return true;
}

function copyBestFitCylinder(
  domainObject: MeasureRadiusDomainObject,
  result: LeastSquareCylinderResult
): void {
  result.height = Cylinder.MinSize; // Use a small height since we only care about radius
  const centerA = result.centerA;
  const centerB = result.centerB;

  const fromViewerMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
  centerA.applyMatrix4(fromViewerMatrix);
  centerB.applyMatrix4(fromViewerMatrix);

  domainObject.cylinder.radius = result.radius;
  domainObject.cylinder.centerA.copy(centerA);
  domainObject.cylinder.centerB.copy(centerB);
}

function intersectionPredicate(domainObject: DomainObject): boolean {
  return !(
    domainObject instanceof MeasureCylinderDomainObject ||
    domainObject instanceof CircleMarkerDomainObject
  );
}

function getMeasureRadius(root: DomainObject): MeasureRadiusDomainObject | undefined {
  return root.getDescendantByType(MeasureRadiusDomainObject);
}

function getOrCreateMeasureRadius(tool: MeasurementTool): MeasureRadiusDomainObject {
  let domainObject = getMeasureRadius(tool.rootDomainObject);
  if (domainObject === undefined) {
    const parent = tool.getOrCreateParent();
    domainObject = new MeasureRadiusDomainObject();
    parent.addChildInteractive(domainObject);
  }
  return domainObject;
}
