import { describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { updateFocusPointMarker } from './updateFocusPointMarker';
import { MeasurementTool } from './MeasurementTool';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { getOrCreateFocusPointMarker } from '../circleMarker/CircleMarkerDomainObject';
import { type PointCloudIntersection } from '@cognite/reveal';
import { createPointCloudMock } from '../../../../tests/tests-utilities/fixtures/pointCloud';

describe(updateFocusPointMarker.name, () => {
  test('Should hide the marker when nothing is intersected', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const marker = getOrCreateFocusPointMarker(renderTarget.root);
    marker.setVisibleInteractive(true);
    expect(marker.isVisible()).toBe(true);

    tool.getIntersection = async () => undefined;

    const result = await updateFocusPointMarker(tool, createMoveEvent());
    expect(result).toBe(false);
    expect(marker.isVisible()).toBe(false);
  });

  test('Should show the marker when point cloud is intersected', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const intersection: PointCloudIntersection = {
      type: 'pointcloud',
      point: new Vector3(),
      pointIndex: 0,
      distanceToCamera: 10,
      model: createPointCloudMock(),
      annotationId: 0
    };
    tool.getIntersection = async () => intersection;

    const marker = getOrCreateFocusPointMarker(renderTarget.root);
    expect(marker.isVisible()).toBe(false);

    const result = await updateFocusPointMarker(tool, createMoveEvent());
    expect(result).toBe(true);
    expect(marker.isVisible()).toBe(true);
  });
});

function createMoveEvent(): PointerEvent {
  return new PointerEvent('pointermove');
}
