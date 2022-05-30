import clamp from 'lodash/clamp';
import { useEffect, useRef, useCallback, useState } from 'react';
import debounce from 'lodash/debounce';

import getInputDeviceFromWheelEvent from './getInputFromWheelEvent';
import InputDevice from './InputDevice';
import useForceUpdate from './useForceUpdate';
import useKeyboardShortcut from './useKeyboardShortcut';

const SECONDARY_MOUSE_BUTTON_INDEX = 2;
const MIN_SCALE = 0.25;
const MAX_SCALE = 15;
const RESIZE_DEBOUNCE_DELAY_MS = 200;

const SCALE_FACTOR = 0.85;
const KEYBOARD_TRANSLATION_FACTOR = 0.05;

type Transform = {
  translation: {
    x: number;
    y: number;
  };
  scale: number;
};

const getClampedScale = (scale: number) => clamp(scale, MIN_SCALE, MAX_SCALE);

const computeNextTransformByScale = (
  scale: number,
  origin: { x: number; y: number },
  transform: Transform
) => {
  const clampedScale = getClampedScale(scale);

  if (transform.scale === clampedScale) {
    return transform;
  }

  const referencePointTo = {
    x: (origin.x - transform.translation.x) / transform.scale,
    y: (origin.y - transform.translation.y) / transform.scale,
  };

  const translation = {
    x: origin.x - referencePointTo.x * clampedScale,
    y: origin.y - referencePointTo.y * clampedScale,
  };

  return {
    translation,
    scale: clampedScale,
  };
};

const usePanning = (
  ref: SVGSVGElement | null,
  { width, height }: { width: number; height: number },
  hasDocumentLoaded: boolean
) => {
  const forceUpdate = useForceUpdate();
  const animationFrameTimer = useRef<number | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (ref) {
      setContainerDimensions(ref?.getBoundingClientRect());

      const handleResize = debounce(
        () => {
          setContainerDimensions({
            width: ref?.getBoundingClientRect().width ?? 0,
            height: ref?.getBoundingClientRect().height ?? 0,
          });
        },
        RESIZE_DEBOUNCE_DELAY_MS,
        {
          leading: false,
          trailing: true,
        }
      );

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      return undefined;
    };
  }, [ref]);

  const throttledForceUpdate = useCallback(() => {
    if (animationFrameTimer.current) {
      cancelAnimationFrame(animationFrameTimer.current);
    }

    animationFrameTimer.current = requestAnimationFrame(() => {
      animationFrameTimer.current = null;
      forceUpdate();
    });
  }, [forceUpdate]);

  const transform = useRef<Transform>({
    translation: { x: 0, y: 0 },
    scale: 1,
  });
  const offset = useRef({
    x: 0,
    y: 0,
  });

  const setTransform: (fn: (t: Transform) => Transform) => void = useCallback(
    (fn: (t: Transform) => Transform) => {
      transform.current = fn(transform.current);
      throttledForceUpdate();
      return transform.current;
    },
    [forceUpdate]
  );

  const setTransformAndCommitOffset = useCallback(
    (fn: (transform: Transform) => Transform) => {
      setTransform((prevTransform) => {
        const nextTransform = fn(prevTransform);
        offset.current = nextTransform.translation;
        return nextTransform;
      });
    },
    [setTransform]
  );

  const zoomIn = useCallback(
    () =>
      setTransformAndCommitOffset((transform) => {
        return computeNextTransformByScale(
          transform.scale / SCALE_FACTOR,
          {
            x: containerDimensions.width / 2,
            y: containerDimensions.height / 2,
          },
          transform
        );
      }),
    [containerDimensions]
  );

  const zoomOut = useCallback(
    () =>
      setTransformAndCommitOffset((transform) => {
        return computeNextTransformByScale(
          transform.scale * SCALE_FACTOR,
          {
            x: containerDimensions.width / 2,
            y: containerDimensions.height / 2,
          },
          transform
        );
      }),
    [containerDimensions]
  );

  const resetZoom = useCallback(() => {
    if (!hasDocumentLoaded) {
      return;
    }

    const scale = Math.min(
      getClampedScale(containerDimensions.height / height),
      getClampedScale(containerDimensions.width / width)
    );
    setTransformAndCommitOffset(() => ({
      translation: {
        x: containerDimensions.width / 2 - (width / 2) * scale,
        y: containerDimensions.height / 2 - (height / 2) * scale,
      },
      scale,
    }));
  }, [ref, hasDocumentLoaded, width, height, containerDimensions]);

  useKeyboardShortcut(
    ref,
    'KeyS',
    () =>
      setTransformAndCommitOffset((transform) => ({
        ...transform,
        translation: {
          x: transform.translation.x,
          y: transform.translation.y - KEYBOARD_TRANSLATION_FACTOR * height,
        },
      })),
    [ref, height]
  );

  useKeyboardShortcut(
    ref,
    'KeyW',
    () =>
      setTransformAndCommitOffset((transform) => ({
        ...transform,
        translation: {
          x: transform.translation.x,
          y: transform.translation.y + KEYBOARD_TRANSLATION_FACTOR * height,
        },
      })),
    [ref, height]
  );

  useKeyboardShortcut(
    ref,
    'KeyA',
    () =>
      setTransformAndCommitOffset((transform) => ({
        ...transform,
        translation: {
          x: transform.translation.x + KEYBOARD_TRANSLATION_FACTOR * width,
          y: transform.translation.y,
        },
      })),
    [ref, width]
  );

  useKeyboardShortcut(
    ref,
    'KeyD',
    () =>
      setTransformAndCommitOffset((transform) => ({
        ...transform,
        translation: {
          x: transform.translation.x - KEYBOARD_TRANSLATION_FACTOR * width,
          y: transform.translation.y,
        },
      })),
    [ref, width]
  );

  useKeyboardShortcut(ref, 'KeyQ', () => zoomOut(), [ref, zoomOut]);
  useKeyboardShortcut(ref, 'KeyE', () => zoomIn(), [ref, zoomIn]);
  useKeyboardShortcut(ref, 'KeyR', () => resetZoom(), [ref, resetZoom]);

  useEffect(() => {
    const handleWheelEvent = (event: WheelEvent) => {
      const inputDevice = getInputDeviceFromWheelEvent(event);

      if (event.ctrlKey || inputDevice === InputDevice.MOUSE) {
        setTransform((prevTransform: Transform) => {
          const transform = computeNextTransformByScale(
            event.deltaY > 0
              ? prevTransform.scale * SCALE_FACTOR
              : prevTransform.scale / SCALE_FACTOR,
            {
              x: event.offsetX,
              y: event.offsetY,
            },
            prevTransform
          );

          offset.current = transform.translation;
          return transform;
        });
        return;
      }

      setTransform(
        (transform: Transform): Transform => ({
          ...transform,
          translation: {
            x: transform.translation.x - event.deltaX,
            y: transform.translation.y - event.deltaY,
          },
        })
      );
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      handleWheelEvent(event);
    };

    const handleMouseDown = (event: MouseEvent) => {
      const isSecondaryMouseButton =
        event.button === SECONDARY_MOUSE_BUTTON_INDEX;

      if (!isSecondaryMouseButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const initialX = event.clientX;
      const initialY = event.clientY;

      const handleMouseMove = (event: MouseEvent) => {
        const deltaX = initialX - event.clientX;
        const deltaY = initialY - event.clientY;

        setTransform((transform) => ({
          ...transform,
          translation: {
            x: offset.current.x - deltaX,
            y: offset.current.y - deltaY,
          },
        }));
      };

      const onFinish = () => {
        setTransformAndCommitOffset((transform) => transform);
        document?.removeEventListener('mousemove', handleMouseMove);
        document?.removeEventListener('mouseup', handleMouseUp);
        document?.removeEventListener('mouseleave', handleMouseLeave);
      };

      const handleMouseLeave = onFinish;
      const handleMouseUp = onFinish;

      document?.addEventListener('mouseleave', handleMouseLeave);
      document?.addEventListener('mousemove', handleMouseMove);
      document?.addEventListener('mouseup', handleMouseUp);
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    ref?.addEventListener('contextmenu', handleContextMenu);
    ref?.addEventListener('mousedown', handleMouseDown);
    ref?.addEventListener('wheel', handleWheel);

    return () => {
      ref?.removeEventListener('wheel', handleWheel);
      ref?.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref]);

  useEffect(() => {
    if (hasDocumentLoaded) {
      resetZoom();
    }
  }, [hasDocumentLoaded]);

  return {
    transform: `translate(${transform.current.translation.x}, ${transform.current.translation.y}) scale(${transform.current.scale})`,
    zoomIn,
    zoomOut,
    resetZoom,
  };
};

export default usePanning;
