import {
  type IFlexibleCameraManager,
  type CameraManager,
  type CameraManagerEventType,
  type CameraState,
  FlexibleControlsType,
  FlexibleControlsOptions,
  type FlexibleControlsTypeChangeDelegate
} from '@cognite/reveal';
import { remove } from 'lodash';
import { Mock } from 'moq.ts';
import { PerspectiveCamera } from 'three';

import { vi, type Mock as viMock } from 'vitest';

export const cameraManagerGlobalCameraEvents: Record<CameraManagerEventType, viMock[]> = {
  cameraChange: [],
  cameraStop: []
};

export function createFlexibleCameraManager(): IFlexibleCameraManager {
  const options = new FlexibleControlsOptions();
  const cameraState: CameraState = {};

  const result = new Mock<IFlexibleCameraManager>()
    .setup((p) => p.on)
    .returns((eventType, callback) =>
      cameraManagerGlobalCameraEvents[eventType].push(vi.fn().mockImplementation(callback))
    )
    .setup((p) => p.off)
    .returns((eventType, callback) =>
      remove(
        cameraManagerGlobalCameraEvents[eventType],
        (element) => element.getMockImplementation() === callback
      )
    )
    .setup((p) => p.setCameraState)
    .returns(({ position, target, rotation }) => {
      cameraState.position = position;
      cameraState.target = target;
      cameraState.rotation = rotation;
      setTimeout(() => {
        cameraManagerGlobalCameraEvents.cameraStop.forEach((callback) => {
          callback(position!, target!);
        });
      }, 50);
    })
    .setup((p) => p.options)
    .returns(options)
    .object();

  result.controlsType = FlexibleControlsType.Orbit;
  result.fitCameraToBoundingBox = vi.fn();
  result.onDoubleClick = vi.fn(async (_event: PointerEvent) => {});
  result.onPointerDown = vi.fn(async (_event: PointerEvent, _leftButton: boolean) => {});
  result.onPointerDrag = vi.fn(async (_event: PointerEvent, _leftButton: boolean) => {});
  result.onPointerUp = vi.fn(async (_event: PointerEvent, _leftButton: boolean) => {});
  result.onWheel = vi.fn(async (_event: WheelEvent, _delta: number) => {});
  result.onKey = vi.fn((_event: KeyboardEvent, _down: boolean) => {});
  result.onFocusChanged = vi.fn((_haveFocus: boolean) => {});

  result.getCamera = () => new PerspectiveCamera();
  result.getCameraState = () => cameraState as Required<CameraState>;

  result.addControlsTypeChangeListener = vi.fn(
    (_callback: FlexibleControlsTypeChangeDelegate) => {}
  );
  result.removeControlsTypeChangeListener = vi.fn();

  return result;
}
