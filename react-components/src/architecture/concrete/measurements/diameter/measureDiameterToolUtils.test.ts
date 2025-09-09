import { assert, describe, expect, test } from 'vitest';
import { MeasurementTool } from '../MeasurementTool';
import { updateMarker, updateMeasureDiameter } from './measureDiameterToolUtils';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import {
  getCircleMarker,
  getOrCreateCircleMarker
} from '../../circleMarker/CircleMarkerDomainObject';
import { Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type PointCloudIntersection } from '@cognite/reveal';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';
import { createPointCloudIntersectionWithCylinder } from './getBestFitCylinder.test';
import { root } from 'happy-dom/lib/PropertySymbol.js';
import { MeasureDiameterDomainObject } from './MeasureDiameterDomainObject';

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

  test('Should not create a cylinder when no intersection ', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    tool.getIntersection = async () => undefined;

    const result = await updateMeasureDiameter(
      tool,
      new Vector3(),
      new PointerEvent('pointermove')
    );
    expect(result).toBe(false);
  });

  test('Should not create a cylinder when no intersection ', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const root = renderTarget.rootDomainObject;

    const circleMarker = getOrCreateCircleMarker(root);
    circleMarker.radius = 1;

    const { intersection, expectedCylinder, cameraPosition } =
      createPointCloudIntersectionWithCylinder(100);
    tool.getIntersection = async () => intersection;

    const result = await updateMeasureDiameter(
      tool,
      cameraPosition,
      new PointerEvent('pointermove')
    );
    expect(result).toBe(true);

    expect(circleMarker.isVisible()).toBe(false);

    const measureDiameter = root.getDescendantByType(MeasureDiameterDomainObject);
    expect(measureDiameter).toBeDefined();
    assert(measureDiameter !== undefined);
    expect(measureDiameter.isVisible()).toBe(true);
    expect(measureDiameter.isSelected).toBe(true);

    const center = expectedCylinder.center.clone();
    const fromViewerMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    center.applyMatrix4(fromViewerMatrix);

    expect(measureDiameter.cylinder.radius).toBeCloseTo(expectedCylinder.radius);
    expect(center.distanceTo(measureDiameter.cylinder.center)).toBeLessThan(0.1);
  });

  test('Should not create a cylinder when no intersection ', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const root = renderTarget.rootDomainObject;

    const circleMarker = getOrCreateCircleMarker(root);
    circleMarker.radius = 0.1; // Small radius to avoid cylinder creation

    const { intersection, cameraPosition } = createPointCloudIntersectionWithCylinder(100);
    tool.getIntersection = async () => intersection;

    const result = await updateMeasureDiameter(
      tool,
      cameraPosition,
      new PointerEvent('pointermove')
    );
    expect(result).toBe(true);

    expect(circleMarker.isVisible()).toBe(true);

    const measureDiameter = root.getDescendantByType(MeasureDiameterDomainObject);
    expect(measureDiameter).toBeUndefined();
  });
});
