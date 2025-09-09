import { describe, expect, test } from 'vitest';
import { MeasurementTool } from '../MeasurementTool';
import { updateMarker } from './measureDiameterToolUtils';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { getOrCreateCircleMarker } from '../../circleMarker/CircleMarkerDomainObject';
import { Vector3 } from 'three';
import { type PointCloudIntersection } from '@cognite/reveal';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';

describe(updateMarker.name, () => {
  test('Should hide the marker when nothing is intersected', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const circleMarker = getOrCreateCircleMarker(renderTarget.rootDomainObject);
    circleMarker.setVisibleInteractive(true);
    expect(circleMarker.isVisible()).toBe(true);

    tool.getIntersection = async () => undefined;

    const result = await updateMarker(tool, new PointerEvent('pointermove'));
    expect(result).toBe(false);
    expect(circleMarker.isVisible()).toBe(false);
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

    const circleMarker = getOrCreateCircleMarker(renderTarget.rootDomainObject);
    expect(circleMarker.isVisible()).toBe(false);

    const result = await updateMarker(tool, new PointerEvent('pointermove'));
    expect(result).toBe(true);
    expect(circleMarker.isVisible()).toBe(true);
  });
});
