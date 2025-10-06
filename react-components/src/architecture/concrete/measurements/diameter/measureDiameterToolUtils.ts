// eslint-disable-next-line prettier/prettier
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import {
  getCircleMarker,
  getFocusPointMarker,
  getOrCreateCircleMarker,
  getOrCreateFocusPointMarker
} from '../../circleMarker/CircleMarkerDomainObject';
import { isPointCloudIntersection } from '../../reveal/pointCloud/isPointCloudIntersection';
import { getBestFitCylinderByIntersection } from './getBestFitCylinderByIntersection';
import { type MeasurementTool } from '../MeasurementTool';
import { type Vector3 } from 'three';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';

export async function updateFocusPointMarker(
  tool: MeasurementTool,
  event: PointerEvent
): Promise<boolean> {
  const intersection = await tool.getIntersection(event);
  if (!isPointCloudIntersection(intersection)) {
    const selectedPoint = getFocusPointMarker(tool.root);
    selectedPoint?.setVisibleInteractive(false);
    return false;
  }
  const marker = getOrCreateFocusPointMarker(tool.root);
  marker.radius = intersection.model.pointSize / 8;
  marker.position.copy(intersection.point);
  marker.notify(Changes.geometry);
  marker.setVisibleInteractive(true);
  return true;
}

export async function updateMarker(tool: MeasurementTool, event: PointerEvent): Promise<boolean> {
  const intersection = await tool.getIntersection(event);
  if (!isPointCloudIntersection(intersection)) {
    const circleMarker = getCircleMarker(tool.root);
    circleMarker?.setVisibleInteractive(false);
    return false;
  }
  const circleMarker = getOrCreateCircleMarker(tool.root);
  circleMarker.position.copy(intersection.point);
  circleMarker.notify(Changes.geometry);
  circleMarker.setDefaultColor();
  circleMarker.setVisibleInteractive(true);
  return true;
}

export async function tryCreateMeasureDiameter(
  tool: MeasurementTool,
  cameraPosition: Vector3,
  event: PointerEvent
): Promise<boolean> {
  const intersection = await tool.getIntersection(event);
  if (!isPointCloudIntersection(intersection)) {
    return false;
  }
  const circleMarker = getOrCreateCircleMarker(tool.root);
  circleMarker.position.copy(intersection.point);
  circleMarker.notify(Changes.geometry);

  const bestFitCylinder = getBestFitCylinderByIntersection(
    intersection,
    cameraPosition,
    circleMarker.radius
  );
  if (bestFitCylinder === undefined) {
    circleMarker.setWarningColor();
    circleMarker.setVisibleInteractive(true);
    return true;
  }
  bestFitCylinder.height = bestFitCylinder.radius / 2; // Just to make it visible, the height is not important for diameter measurement
  const measureDiameter = tool.createMeasureDiameter();
  const { cylinder } = measureDiameter;
  bestFitCylinder.copyTo(cylinder);
  cylinder.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

  circleMarker.setVisibleInteractive(false);
  measureDiameter.notify(Changes.geometry);
  measureDiameter.setFocusInteractive(FocusType.Body);
  measureDiameter.setSelectedInteractive(true);
  measureDiameter.setVisibleInteractive(true);
  return true;
}
