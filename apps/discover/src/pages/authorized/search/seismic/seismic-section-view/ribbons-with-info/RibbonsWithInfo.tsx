import React, { useMemo, useState } from 'react';

import { NOT_AVAILABLE } from 'constants/empty';

import { XAxisData, YAxisData } from '../types';

import { CanvasOverlay, HorizontalRibbon, VerticalRibbon } from './elements';
import InfoViewer from './InfoViewer';

interface Props {
  hide: boolean;
  width: number;
  height: number;
  xData: XAxisData[];
  yData: YAxisData[];
}

const WRAPPER_PADDING = 30;

export const RibbonsWithInfo: React.FC<Props> = (props) => {
  const [position, setPosition] = useState<number[]>([0, 0, 0]);

  const { hide, width, height, xData, yData } = props;

  const handleMouseMoveOverlay = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const { offsetY, clientX, offsetX } = event.nativeEvent;
    setPosition([
      clientX - WRAPPER_PADDING + 4,
      offsetY + WRAPPER_PADDING - 2,
      offsetX,
      offsetY,
    ]);
  };

  // Get closest x axis informations on mouse move
  const xInfo = useMemo(() => {
    if (!xData.length) {
      return null;
    }
    return xData.reduce((prev, curr) => {
      return Math.abs(curr.left - position[2]) <
        Math.abs(prev.left - position[2])
        ? curr
        : prev;
    });
  }, [position, xData]);

  // Get closest y axis informations on mouse move
  const yInfo = useMemo(() => {
    if (!yData.length) {
      return null;
    }
    return yData.reduce((prev, curr) => {
      return Math.abs(curr.top - position[3]) < Math.abs(prev.top - position[3])
        ? curr
        : prev;
    });
  }, [position, yData]);

  if (hide) {
    return null;
  }

  return (
    <>
      {
        // Hide ribbons and info panel on 0, 0 possition
        position[0] > 0 && position[1] > 0 && (
          <>
            {xInfo && (
              <InfoViewer
                position={position}
                x={xInfo.x}
                y={xInfo.y}
                trace={xInfo.index + 1}
                amplitude={yInfo ? xInfo.traceList[yInfo.value] : NOT_AVAILABLE}
              />
            )}
            <VerticalRibbon
              data-testid="vertical-ribbon"
              position={position[0]}
            />
            <HorizontalRibbon
              data-testid="horizontal-ribbon"
              position={position[1]}
            />
          </>
        )
      }
      <CanvasOverlay
        width={width}
        height={height}
        onMouseMove={handleMouseMoveOverlay}
      />
    </>
  );
};

export default RibbonsWithInfo;
