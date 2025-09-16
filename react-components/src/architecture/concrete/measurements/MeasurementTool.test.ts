import { describe, expect, test, vi } from 'vitest';
import { MeasurementTool } from './MeasurementTool';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { getCircleMarker, getOrCreateCircleMarker } from '../circleMarker/CircleMarkerDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { MOUSE } from 'three';
import { createPointCloudIntersectionWithCylinder } from './diameter/getBestFitCylinderByIntersection.test';
import { Mock } from 'moq.ts';

describe(MeasurementTool.name, () => {
  test('Should hover over empty space', async () => {
    const tool = new MeasurementTool();
    tool.primitiveType = PrimitiveType.Diameter;
    tool.getIntersection = async () => undefined;

    const renderTarget = createFullRenderTargetMock();
    tool.attach(renderTarget);

    expect(getCircleMarker(renderTarget.root)).toBeUndefined();
    await tool.onHoverByDebounce(createMouseHoverEvent());
    expect(getCircleMarker(renderTarget.root)).toBeUndefined();
  });

  test('Should hover over a point cloud', async () => {
    const tool = new MeasurementTool();
    tool.primitiveType = PrimitiveType.Diameter;
    const { intersection } = createPointCloudIntersectionWithCylinder(1);
    tool.getIntersection = async () => intersection;

    const renderTarget = createFullRenderTargetMock();
    tool.attach(renderTarget);

    expect(getCircleMarker(renderTarget.root)).toBeUndefined();
    await tool.onHoverByDebounce(createMouseHoverEvent());
    expect(getCircleMarker(renderTarget.root)).toBeDefined();
  });

  test('Should click on empty space', async () => {
    const tool = new MeasurementTool();
    tool.primitiveType = PrimitiveType.Diameter;
    tool.getIntersection = async () => undefined;

    const renderTarget = createFullRenderTargetMock();
    tool.attach(renderTarget);

    expect(getCircleMarker(renderTarget.root)).toBeUndefined();
    await tool.onClick(createClickEvent());
    expect(getCircleMarker(renderTarget.root)).toBeUndefined();
  });

  test('Should click on point cloud', async () => {
    const tool = new MeasurementTool();
    tool.primitiveType = PrimitiveType.Diameter;
    const { intersection } = createPointCloudIntersectionWithCylinder(1);
    tool.getIntersection = async () => intersection;

    const renderTarget = createFullRenderTargetMock();
    tool.attach(renderTarget);

    expect(getCircleMarker(renderTarget.root)).toBeUndefined();
    await tool.onClick(createClickEvent());
    expect(getCircleMarker(renderTarget.root)).toBeDefined();
  });

  test('Should call wheel on the marker if marker is visible', async () => {
    const tool = new MeasurementTool();
    tool.primitiveType = PrimitiveType.Diameter;
    tool.getIntersection = async () => undefined;
    const renderTarget = createFullRenderTargetMock();
    tool.attach(renderTarget);

    const marker = getOrCreateCircleMarker(renderTarget.root);
    marker.setVisibleInteractive(true);
    marker.onWheel = vi.fn();

    await tool.onWheel(createShiftWheelEvent(), 1);
    expect(marker.onWheel).toHaveBeenCalledOnce();
  });

  test('Should not call wheel on the marker if marker is invisible', async () => {
    const tool = new MeasurementTool();
    tool.primitiveType = PrimitiveType.Diameter;
    tool.getIntersection = async () => undefined;
    const renderTarget = createFullRenderTargetMock();
    tool.attach(renderTarget);

    const marker = getOrCreateCircleMarker(renderTarget.root);
    marker.setVisibleInteractive(false);
    marker.onWheel = vi.fn();

    await tool.onWheel(createShiftWheelEvent(), 1);
    expect(marker.onWheel).not.toBeCalled();
  });
});

function createShiftWheelEvent(): WheelEvent {
  // Wheel event does not allow setting the shiftKey directly in the constructor, so we use a mock
  const mock = new Mock<WheelEvent>().setup((p) => p.shiftKey).returns(true);
  return mock.object();
}

function createClickEvent(): PointerEvent {
  return new PointerEvent('click', { button: MOUSE.LEFT });
}

function createMouseHoverEvent(): PointerEvent {
  return new PointerEvent('pointermove');
}
