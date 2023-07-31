import React, { useState, useRef, useEffect, useMemo } from 'react';
import { withSize } from 'react-sizeme';

import { ZOOM_FACTOR } from './constants';
import { SeismicImageWrapper, StyledCanvas } from './elements';
import { HorizontalRanges } from './HorizontalRanges';
import RibbonsWithInfo from './ribbons-with-info/RibbonsWithInfo';
import { Tuplet, XAxisData, WheelEvent, YAxisData } from './types';
import {
  getCanvasImage,
  getDiffOnZoom,
  getValidDiffOnPan,
  getValidDiffOnZoom,
} from './utils';

interface Props {
  height: number;
  width: number;
  data: Uint8ClampedArray;
  disableZoom?: boolean;
  zoomLevel: number;
  cursorMode?: string;
  horizontalRange?: XAxisData[];
  horizontalRangeType?: string;
  onZoomLevelChange?: (value: number) => void;
}

const SeismicImage: React.FC<Props> = ({
  height,
  width,
  data,
  disableZoom,
  zoomLevel,
  cursorMode,
  horizontalRange = [],
  horizontalRangeType,
  onZoomLevelChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDown, setIsDown] = useState(false);
  // Top right position of visible canvas area
  const [diffXY, setDiffXY] = useState<Tuplet>([0, 0]);
  const [dragStartXY, setDragStartXY] = useState([0, 0]);
  const [canvasXY, setCanvasXY] = useState([0, 0]);
  const [prevZoomLevel, setPrevZoomLevel] = useState(1);

  // Get canvas data as image
  const canvasImage = useMemo(() => {
    return getCanvasImage(width, height, data);
  }, [width, height, data]);

  // Draw image on zooming and panning effects applied
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      if (ctx) {
        ctx.scale(zoomLevel, zoomLevel);
        ctx.drawImage(canvasImage, diffXY[0], diffXY[1]);
      }
    }
  }, [data, width, height, canvasRef, diffXY]);

  useEffect(() => {
    // Get previoues zoomed position
    const zoomedXY = getDiffOnZoom([width, height], prevZoomLevel);

    // Get previoues panned difference
    const pannedX = zoomedXY[0] - diffXY[0];
    const pannedY = zoomedXY[1] - diffXY[1];

    // Get new zoomed position
    const newZoomedXY = getDiffOnZoom([width, height], zoomLevel);

    // Apply previous panned difference
    const newX = newZoomedXY[0] - pannedX;
    const newY = newZoomedXY[1] - pannedY;

    // Validate new position
    const validDiffXY = getValidDiffOnZoom(
      [newX, newY],
      diffXY,
      [width, height],
      zoomLevel
    );

    setDiffXY(validDiffXY);
    setCanvasXY(validDiffXY);
    setPrevZoomLevel(zoomLevel);
  }, [zoomLevel]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!disableZoom) {
      setIsDown(true);
      setDragStartXY([event.nativeEvent.offsetX, event.nativeEvent.offsetY]);
    }
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (isDown && cursorMode === 'pan') {
      const { offsetX, offsetY } = event.nativeEvent;
      // Get canvas top right position difference on panning
      const diffX = canvasXY[0] + (offsetX - dragStartXY[0]) / zoomLevel;
      const diffY = canvasXY[1] + (offsetY - dragStartXY[1]) / zoomLevel;
      // Validate new position
      const newDiffXY = getValidDiffOnPan(
        [diffX, diffY],
        diffXY,
        [width, height],
        zoomLevel
      );
      setDiffXY(newDiffXY);
    }
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setCanvasXY([...diffXY]);
  };

  // Change zoomlevel on mouse wheel change
  const handleMouseWheel = (event: WheelEvent) => {
    if (!onZoomLevelChange) {
      return;
    }
    if (event.nativeEvent.wheelDelta < 0) {
      const newZoomLevel = zoomLevel - ZOOM_FACTOR;
      if (newZoomLevel >= 1) {
        onZoomLevelChange(newZoomLevel);
      }
    } else {
      onZoomLevelChange(zoomLevel + ZOOM_FACTOR);
    }
  };

  // Get canvas actual width and height to set in axis elements
  // (This updates on browser size change with sizeme library)
  const canvasDisplayWidth = canvasRef.current?.clientWidth as number;
  const canvasDisplayHeight = canvasRef.current?.clientHeight as number;

  const { xRange, xData, yData } = useMemo(() => {
    // Get maximun number of x axis units
    const displayableCount = (canvasDisplayWidth / 50) * zoomLevel;
    const modValue = Math.round(horizontalRange.length / displayableCount);

    const reducePercentage = (diffXY[0] / width) * zoomLevel * 100 * -1;

    // Slice informations on x axis line
    const xData = horizontalRange
      .map((row, index) => {
        const leftInPercentage =
          (index / horizontalRange.length) * zoomLevel * 100 - reducePercentage;

        const leftInPixel = (canvasDisplayWidth / 100) * leftInPercentage;
        return {
          ...row,
          left: leftInPixel,
        };
      })
      .filter((row) => row.left >= 0 && row.left <= canvasDisplayWidth);

    // X axis displayable numbers
    const xRange = xData.filter((row) => row.index % modValue === 0);

    // Slice informations on y axis line
    const verticalRange = Array.from(Array(height).keys());
    const reducePercentageY = (diffXY[1] / height) * zoomLevel * 100 * -1;
    const yData: YAxisData[] = verticalRange
      .map((row, index) => {
        const leftInPercentage =
          (index / verticalRange.length) * zoomLevel * 100 - reducePercentageY;

        const topInPixel = (canvasDisplayHeight / 100) * leftInPercentage;
        return {
          index,
          value: row,
          top: topInPixel,
        };
      })
      .filter((row) => row.top >= 0 && row.top <= canvasDisplayHeight);

    return { xRange, xData, yData };
  }, [canvasXY, zoomLevel, canvasDisplayWidth, canvasDisplayHeight]);

  return (
    <SeismicImageWrapper>
      <HorizontalRanges
        type={horizontalRangeType}
        width={canvasDisplayWidth}
        range={xRange}
      />
      <RibbonsWithInfo
        hide={cursorMode !== 'info'}
        width={canvasDisplayWidth}
        height={canvasDisplayHeight}
        xData={xData}
        yData={yData}
      />
      <StyledCanvas
        cursorMode={cursorMode}
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleMouseWheel}
      />
    </SeismicImageWrapper>
  );
};

export default withSize({ monitorHeight: true })(SeismicImage);
