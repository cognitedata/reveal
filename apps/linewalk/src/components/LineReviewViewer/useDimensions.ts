import throttle from 'lodash/throttle';
import React, { useEffect, useState } from 'react';

const DIMENSION_UPDATE_THROTTLE_MS = 25;
const RESIZE_THROTTLE_MS = 50;

const createResizeHandler = (
  ref: HTMLElement | null,
  onMove: (o: {
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    deltaX: number;
    deltaY: number;
  }) => void
) => {
  if (ref === null) {
    return () => {
      return undefined;
    };
  }

  return (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let isResizing = true;
    const mouseDownInitialX = e.clientX;
    const mouseDownInitialY = e.clientY;
    const mouseDownOffsetX = e.nativeEvent.offsetX;
    const mouseDownOffsetY = e.nativeEvent.offsetY;
    const {
      width: initialWidth,
      height: initialHeight,
      x: initialX,
      y: initialY,
    } = ref.getBoundingClientRect();

    const onMouseMove = throttle((e: MouseEvent) => {
      if (isResizing) {
        const deltaX =
          Math.min(window.innerWidth, Math.max(mouseDownOffsetX, e.clientX)) -
          mouseDownInitialX;
        const deltaY =
          Math.min(window.innerHeight, Math.max(mouseDownOffsetY, e.clientY)) -
          mouseDownInitialY;
        onMove({
          initialHeight,
          initialWidth,
          initialX,
          initialY,
          deltaX,
          deltaY,
        });
      }
    }, DIMENSION_UPDATE_THROTTLE_MS);

    const onMouseUp = () => {
      isResizing = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
};

type Dimensions = {
  width: number;
  height: number;
  x: number;
  y: number;
};

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

const constrainDimensions = (
  dimensions: Dimensions,
  { minWidth, minHeight }: { minWidth: number; minHeight: number }
): Dimensions => {
  const constrainedWidth = Math.max(
    minWidth,
    Math.min(dimensions.width, window.innerWidth - Math.max(0, dimensions.x))
  );
  const constrainedHeight = Math.max(
    minHeight,
    Math.min(dimensions.height, window.innerHeight - Math.max(0, dimensions.y))
  );
  return {
    x: Math.max(
      0,
      Math.min(dimensions.x, window.innerWidth - constrainedWidth)
    ),
    y: Math.max(
      0,
      Math.min(dimensions.y, window.innerHeight - constrainedHeight)
    ),
    width: constrainedWidth,
    height: constrainedHeight,
  };
};

const useDimensions = (
  ref: HTMLElement | null,
  initialDimensions: { width: number; height: number; x: number; y: number },
  options: { minWidth: number; minHeight: number } = {
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
  }
) => {
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);

  const setConstrainedDimensions = (nextDimensions: Dimensions) =>
    setDimensions(constrainDimensions(nextDimensions, options));

  useEffect(() => {
    const handleWindowResize = throttle(() => {
      setDimensions((dimensions) => constrainDimensions(dimensions, options));
    }, RESIZE_THROTTLE_MS);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (ref === null) {
      return;
    }

    e.preventDefault();
    let isDragging = true;
    const modalBoundingClientRect = ref.getBoundingClientRect();
    const initialX = e.clientX - modalBoundingClientRect.x;
    const initialY = e.clientY - modalBoundingClientRect.y;

    const onMouseMove = throttle((e) => {
      if (isDragging) {
        setDimensions((dimensions) => ({
          ...dimensions,
          x: Math.min(
            Math.max(0, e.clientX - initialX),
            window.innerWidth - dimensions.width
          ),
          y: Math.min(
            Math.max(0, e.clientY - initialY),
            window.innerHeight - dimensions.height
          ),
        }));
      }
    }, DIMENSION_UPDATE_THROTTLE_MS);

    const onMouseUpHandler = () => {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUpHandler);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUpHandler);
  };

  const onResizeBottomRight = createResizeHandler(
    ref,
    ({ initialHeight, initialWidth, deltaX, deltaY, initialX, initialY }) =>
      setConstrainedDimensions({
        x: initialX,
        y: initialY,
        width: initialWidth + deltaX,
        height: initialHeight + deltaY,
      })
  );

  const onResizeBottomLeft = createResizeHandler(
    ref,
    ({ initialHeight, initialWidth, deltaX, deltaY, initialX, initialY }) =>
      setConstrainedDimensions({
        x: initialX + Math.min(deltaX, initialWidth - options.minWidth),
        y: initialY,
        width: initialWidth - deltaX,
        height: initialHeight + deltaY,
      })
  );

  const onResizeTopLeft = createResizeHandler(
    ref,
    ({ initialHeight, initialWidth, deltaX, deltaY, initialX, initialY }) =>
      setConstrainedDimensions({
        x: initialX + Math.min(deltaX, initialWidth - options.minWidth),
        y: initialY + Math.min(deltaY, initialHeight - options.minHeight),
        width: initialWidth - deltaX,
        height: initialHeight - deltaY,
      })
  );

  const onResizeTopRight = createResizeHandler(
    ref,
    ({ initialHeight, initialWidth, deltaX, deltaY, initialX, initialY }) =>
      setConstrainedDimensions({
        x: initialX,
        y: initialY + Math.min(deltaY, initialHeight - options.minHeight),
        width: initialWidth + deltaX,
        height: initialHeight - deltaY,
      })
  );

  return {
    dimensions,
    onMove,
    onResizeTopLeft,
    onResizeTopRight,
    onResizeBottomRight,
    onResizeBottomLeft,
  };
};

export default useDimensions;
