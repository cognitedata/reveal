// eslint-disable-next-line prettier/prettier
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import {
  getFocusPointMarker,
  getOrCreateFocusPointMarker
} from '../circleMarker/CircleMarkerDomainObject';
import { isPointCloudIntersection } from '../reveal/pointCloud/isPointCloudIntersection';
import { type MeasurementTool } from './MeasurementTool';

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
