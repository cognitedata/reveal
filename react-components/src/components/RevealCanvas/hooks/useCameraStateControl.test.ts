/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from 'vitest';

import { renderHook } from '@testing-library/react';

import { Vector3 } from 'three';
import { cameraManagerGlobalCameraEvents } from '#test-utils/fixtures/cameraManager';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { useCameraStateControl, type CameraStateParameters } from './useCameraStateControl';

vi.mock('../ViewerContext', () => ({
  useReveal: () => viewerMock
}));

describe(useCameraStateControl.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('does nothing when inputs are undefined', () => {
    const { rerender } = renderHook(() => {
      useCameraStateControl();
    });

    vi.runAllTimers();
    rerender();
    vi.runAllTimers();

    cameraManagerGlobalCameraEvents.cameraStop.forEach((mockCallback) => {
      expect(mockCallback).not.toBeCalled();
    });
  });

  test('does nothing if external camera state is undefined', () => {
    const setter = vi.fn();
    const { rerender } = renderHook(() => {
      useCameraStateControl(undefined, setter);
    });

    vi.runAllTimers();
    rerender();
    vi.runAllTimers();

    expect(setter).not.toBeCalled();
  });

  test('calls internal cameraStop delegates but not external setter on applying external camera state', () => {
    const setter = vi.fn<(cameraState?: CameraStateParameters) => void>();

    const { rerender } = renderHook(
      ({ position }: { position: Vector3 }) => {
        useCameraStateControl({ position: position.clone(), target: new Vector3(1, 1, 1), direction: new Vector3(0, 0, 1) }, setter);
      },
      { initialProps: { position: new Vector3(0, 0, 0) } }
    );

    vi.runAllTimers();
    rerender({ position: new Vector3(1, 0, 0) });

    vi.runAllTimers();
    expect(setter).not.toBeCalled();

    cameraManagerGlobalCameraEvents.cameraStop.forEach((mockCallback) => {
      expect(mockCallback).toBeCalledTimes(1);
    });
  });

  test('provided setter is called after updating camera state internally for each parameter', () => {
    const setter = vi.fn<(cameraState?: CameraStateParameters) => void>();

    const { rerender } = renderHook(() => {
      useCameraStateControl(
        { position: new Vector3(0, 0, 0), target: new Vector3(1, 1, 1), direction: new Vector3(0, 0, 1) },
        setter
      );
    });

    vi.runAllTimers();

    viewerMock.cameraManager.setCameraState({
      position: new Vector3(1, 0, 0),
      target: new Vector3(1, 1, 1),
      direction: new Vector3(0, 0, 1)
    });


    rerender();

    viewerMock.cameraManager.setCameraState({
      position: new Vector3(0, 0, 0),
      target: new Vector3(0, 0, 1),
      direction: new Vector3(0, 0, 1)
    });

    rerender();

    viewerMock.cameraManager.setCameraState({
      position: new Vector3(0, 0, 0),
      target: new Vector3(1, 1, 1),
      direction: new Vector3(0, 1, 1)
    });

    rerender();
    vi.runAllTimers();

    expect(setter).toHaveBeenCalledTimes(3);
  });

});
