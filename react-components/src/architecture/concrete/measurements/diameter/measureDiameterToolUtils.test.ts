import { assert, describe, expect, test } from 'vitest';
import { MeasurementTool } from '../MeasurementTool';
import { updateMarker, updateMeasureDiameter } from './measureDiameterToolUtils';
import { getOrCreateCircleMarker } from '../../circleMarker/CircleMarkerDomainObject';
import { MOUSE, Vector3 } from 'three';
import { CDF_TO_VIEWER_TRANSFORMATION, type PointCloudIntersection } from '@cognite/reveal';
import { createPointCloudIntersectionWithCylinder } from './getBestFitCylinderByIntersection.test';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { MeasureCylinderDomainObject } from '../MeasureCylinderDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';

const POINT_COUNT = 100;

describe(updateMarker.name, () => {
  test('Should hide the marker when nothing is intersected', async () => {
    const renderTarget = createFullRenderTargetMock();
    const tool = new MeasurementTool();
    tool.attach(renderTarget);

    const circleMarker = getOrCreateCircleMarker(renderTarget.root);
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

    const circleMarker = getOrCreateCircleMarker(renderTarget.root);
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

    const root = renderTarget.root;

    const circleMarker = getOrCreateCircleMarker(root);
    circleMarker.radius = circleMarker.legalRadiusRange.min; // Small radius to avoid cylinder creation

    const { intersection, cameraPosition } = createPointCloudIntersectionWithCylinder(POINT_COUNT);
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

    const root = renderTarget.root;

    const circleMarker = getOrCreateCircleMarker(root);
    circleMarker.radius = 1;

    const { intersection, expectedCylinder, cameraPosition } =
      createPointCloudIntersectionWithCylinder(POINT_COUNT);
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

function createClickEvent(): PointerEvent {
  return new PointerEvent('click', { button: MOUSE.LEFT });
}

function createMoveEvent(): PointerEvent {
  return new PointerEvent('pointermove');
}

function getMeasureDiameter(root: RootDomainObject): MeasureCylinderDomainObject | undefined {
  for (const descendant of root.getDescendantsByType(MeasureCylinderDomainObject)) {
    if (descendant.primitiveType === PrimitiveType.Diameter) {
      return descendant;
    }
  }
  return undefined;
}
