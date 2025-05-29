import { type CameraManager, type CameraManagerEventType, type CameraState } from '@cognite/reveal';
import { remove } from 'lodash';
import { Mock } from 'moq.ts';
import { PerspectiveCamera } from 'three';

import { vi, type Mock as viMock } from 'vitest';

export const ARBITRARY_CALLBACK_DELAY = 50; // ms

export const cameraManagerGlobalCameraEvents: Record<CameraManagerEventType, viMock[]> = {
  cameraChange: [],
  cameraStop: []
};

const cameraManagerGlobalCurrentCameraState: CameraState = {};
export const fitCameraToBoundingBoxMock = vi.fn<CameraManager['fitCameraToBoundingBox']>();

export const cameraManagerMock = new Mock<CameraManager>()
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
    cameraManagerGlobalCurrentCameraState.position = position;
    cameraManagerGlobalCurrentCameraState.target = target;
    cameraManagerGlobalCurrentCameraState.rotation = rotation;
    setTimeout(() => {
      cameraManagerGlobalCameraEvents.cameraStop.forEach((callback) => {
        callback(position!, target!);
      });
    }, ARBITRARY_CALLBACK_DELAY);
  })
  .setup((p) => p.getCameraState())
  .returns(cameraManagerGlobalCurrentCameraState as Required<CameraState>)
  .setup((p) => p.getCamera)
  .returns(() => new PerspectiveCamera())
  .setup((p) => p.fitCameraToBoundingBox)
  .returns(fitCameraToBoundingBoxMock)
  .object();
