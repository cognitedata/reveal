import { assert, describe, expect, test } from 'vitest';
import { MeasurementTool } from '../MeasurementTool';
import { shouldIntersect, updateMarker, updateMeasureDiameter } from './measureDiameterToolUtils';
import {
  CircleMarkerDomainObject,
  getOrCreateCircleMarker
} from '../../circleMarker/CircleMarkerDomainObject';
import { MOUSE, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type PointCloudIntersection } from '@cognite/reveal';
import { createPointCloudIntersectionWithCylinder } from './getBestFitCylinderByIntersection.test';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { getMeasureDiameter, MeasureCylinderDomainObject } from '../MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';

describe(updateMarker.name, () => {
  test('Should hide the marker when nothing is intersected', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const circleMarker = getOrCreateCircleMarker(renderTarget.rootDomainObject);
    circleMarker.setVisibleInteractive(true);
    expect(circleMarker.isVisible()).toBe(true);

    tool.getIntersection = async () => undefined;

    const result = await updateMarker(tool, createMoveEvent());
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

    const result = await updateMarker(tool, createMoveEvent());
    expect(result).toBe(true);
    expect(circleMarker.isVisible()).toBe(true);
  });
});

describe(updateMeasureDiameter.name, () => {
  test('Should not create a cylinder when no intersection ', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    tool.getIntersection = async () => undefined;

    const result = await updateMeasureDiameter(tool, new Vector3(), createClickEvent());
    expect(result).toBe(false);
  });

  test('Should not create a cylinder when radius of the circle marker is too small', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const root = renderTarget.rootDomainObject;

    const circleMarker = getOrCreateCircleMarker(root);
    circleMarker.radius = 0.1; // Small radius to avoid cylinder creation

    const { intersection, cameraPosition } = createPointCloudIntersectionWithCylinder(100);
    tool.getIntersection = async () => intersection;

    const result = await updateMeasureDiameter(tool, cameraPosition, createClickEvent());
    expect(result).toBe(true);

    expect(circleMarker.isVisible()).toBe(true);

    const measureDiameter = getMeasureDiameter(root);
    expect(measureDiameter).toBeUndefined();
  });

  test('Should create a cylinder', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const root = renderTarget.rootDomainObject;

    const circleMarker = getOrCreateCircleMarker(root);
    circleMarker.radius = 1;

    const { intersection, expectedCylinder, cameraPosition } =
      createPointCloudIntersectionWithCylinder(100);
    tool.getIntersection = async () => intersection;

    const result = await updateMeasureDiameter(tool, cameraPosition, createClickEvent());
    expect(result).toBe(true);

    expect(circleMarker.isVisible()).toBe(false);

    const measureDiameter = getMeasureDiameter(root);
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
});

describe(shouldIntersect.name, () => {
  test('Should intersect', () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.Cylinder);
    expect(shouldIntersect(domainObject)).toBe(true);
  });

  test('Should not intersect when the diameter measurement given', async () => {
    const domainObject = new MeasureCylinderDomainObject(PrimitiveType.Diameter);
    expect(shouldIntersect(domainObject)).toBe(false);
  });

  test('Should not intersect when the circle marker is given', async () => {
    const domainObject = new CircleMarkerDomainObject();
    expect(shouldIntersect(domainObject)).toBe(false);
  });
});

function createClickEvent(): PointerEvent {
  return new PointerEvent('click', { button: MOUSE.LEFT });
}

function createMoveEvent(): PointerEvent {
  return new PointerEvent('pointermove');
}
