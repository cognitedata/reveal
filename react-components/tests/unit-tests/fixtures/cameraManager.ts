import { type CameraManager, type CameraManagerEventType, type CameraState } from '@cognite/reveal';
import { remove } from 'lodash';
import { Mock } from 'moq.ts';
import { type Box3, type Vector3 } from 'three';

import { vi, type Mock as viMock } from 'vitest';

export const cameraManagerGlobalCameraEvents: Record<
  CameraManagerEventType,
  Array<viMock<[Vector3, Vector3], void>>
> = {
  cameraChange: [],
  cameraStop: []
};

const cameraManagerGlobalCurrentCameraState: CameraState = {};
export const fitCameraToBoundingBoxMock = vi.fn<[Box3], void>();

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
  .returns(({ position, target }) => {
    cameraManagerGlobalCurrentCameraState.position = position;
    cameraManagerGlobalCurrentCameraState.target = target;
    setTimeout(() => {
      cameraManagerGlobalCameraEvents.cameraStop.forEach((callback) => {
        callback(position!, target!);
      });
    }, 50);
  })
  .setup((p) => p.getCameraState())
  .returns(cameraManagerGlobalCurrentCameraState as Required<CameraState>)
  .setup((p) => p.fitCameraToBoundingBox)
  .returns(fitCameraToBoundingBoxMock)
  .object();
