import { describe, expect, test, vi, beforeEach, beforeAll, afterAll, Mock } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import {
  viewerMock,
  viewerCameraOn,
  viewerCameraOff,
  viewerGlobalCameraEvents
} from '../../../fixtures/viewer';
import { CameraManagerEventType, CameraStopDelegate } from '@cognite/reveal';
import {
  CameraStateParameters,
  useCameraStateControl
} from '../../../../../src/components/RevealCanvas/hooks/useCameraStateControl';
import { remove } from 'lodash';
import { Vector3 } from 'three';

vi.mock('../../../../../src/components/RevealCanvas/ViewerContext', () => ({
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
    const { rerender } = renderHook(() => useCameraStateControl());

    vi.runAllTimers();
    rerender();
    vi.runAllTimers();

    viewerGlobalCameraEvents.cameraStop.forEach((mockCallback) =>
      expect(mockCallback).not.toBeCalled()
    );
  });

  test('does nothing if external camera state is undefined', () => {
    const setter = vi.fn();
    const { rerender } = renderHook(() => useCameraStateControl(undefined, setter));

    vi.runAllTimers();
    rerender();
    vi.runAllTimers();

    expect(setter).not.toBeCalled();
  });

  test('calls internal cameraStop delegates but not external setter on applying external camera state', () => {
    const setter = vi.fn<[CameraStateParameters | undefined], void>();

    const { rerender } = renderHook(() =>
      useCameraStateControl(
        { position: new Vector3(0, 0, 0), target: new Vector3(1, 1, 1) },
        setter
      )
    );

    vi.runAllTimers();
    renderHook(() =>
      useCameraStateControl(
        { position: new Vector3(1, 0, 0), target: new Vector3(1, 1, 1) },
        setter
      )
    );

    act(() => {
      vi.advanceTimersByTime(1000);
      vi.runAllTimers();
    });

    vi.runAllTimers();
    expect(setter).not.toBeCalled();

    viewerGlobalCameraEvents.cameraStop.forEach((mockCallback) =>
      expect(mockCallback).toBeCalledTimes(1)
    );
  });

  test('provided setter is called after updating camera state internally', () => {
    const setter = vi.fn<[CameraStateParameters | undefined], void>();

    const { rerender } = renderHook(() =>
      useCameraStateControl(
        { position: new Vector3(0, 0, 0), target: new Vector3(1, 1, 1) },
        setter
      )
    );

    vi.runAllTimers();

    viewerMock.cameraManager.setCameraState({
      position: new Vector3(1, 0, 0),
      target: new Vector3(1, 1, 1)
    });

    rerender();
    vi.runAllTimers();

    expect(setter).toHaveBeenCalled();
  });
});
