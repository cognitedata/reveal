import React, { useState } from 'react';

import layers from '../../utils/z';

import useDimensions from './useDimensions';

const INITIAL_WIDTH = 400;
const INITIAL_HEIGHT = 280;
const RESIZABLE_CORNER_SIZE = 15;

type Props = {
  initialDimensions: {
    width?: number;
    height?: number;
    x: number;
    y: number;
  };
  renderFunc: ({
    onMove,
  }: {
    onMove: (event: React.MouseEvent) => void;
  }) => React.ReactNode;
};

const PopupModal: React.FC<Props> = ({ renderFunc, initialDimensions }) => {
  const [modalRef, setModalRef] = useState<HTMLElement | null>(null);
  const {
    dimensions,
    onMove,
    onResizeBottomRight,
    onResizeBottomLeft,
    onResizeTopLeft,
    onResizeTopRight,
  } = useDimensions(
    modalRef,
    {
      width: initialDimensions.width ?? INITIAL_WIDTH,
      height: initialDimensions.height ?? INITIAL_HEIGHT,
      x: initialDimensions.x,
      y: initialDimensions.y,
    },
    {
      minWidth: 300,
      minHeight: 200,
    }
  );

  return (
    <div
      ref={(ref) => setModalRef(ref)}
      style={{
        position: 'fixed',
        top: dimensions.y,
        left: dimensions.x,
        width: dimensions.width,
        height: dimensions.height,
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        borderRadius: 8,
        zIndex: layers.OVERLAY,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          cursor: 'nwse-resize',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        role="button"
        aria-label="Resize"
        tabIndex={-1}
        onMouseDown={onResizeBottomRight}
      />
      <div
        style={{
          cursor: 'nesw-resize',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeBottomLeft}
      />
      <div
        style={{
          cursor: 'nwse-resize',
          position: 'absolute',
          top: 0,
          left: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeTopLeft}
      />
      <div
        style={{
          cursor: 'nesw-resize',
          position: 'absolute',
          top: 0,
          right: 0,
          width: RESIZABLE_CORNER_SIZE,
          height: RESIZABLE_CORNER_SIZE,
        }}
        aria-label="Resize"
        role="button"
        tabIndex={-1}
        onMouseDown={onResizeTopRight}
      />
      {renderFunc({ onMove })}
    </div>
  );
};

export default PopupModal;
