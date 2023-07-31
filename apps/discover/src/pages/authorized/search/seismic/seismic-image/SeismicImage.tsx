import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  height: number;
  width: number;
  data: any;
  disableZoom?: boolean;
}
export const SeismicImage: React.FC<Props> = ({
  height,
  width,
  data,
  disableZoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [initialX, setinitialX] = useState(0);
  const [initialY, setInitialY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const [hasZoomed, setHasZoomed] = useState(false);

  const drawImage = useCallback(
    (ctx: any) => {
      const idata = ctx.createImageData(width, height);
      idata.data.set(data);
      ctx.putImageData(idata, 0, 0);
    },
    [width, height, data]
  );

  useEffect(() => {
    const createImage = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        drawImage(ctx);
      }
    };

    if (hasZoomed) {
      const canvas = canvasRef.current;
      if (canvas) {
        const image = canvas.toDataURL();
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const imageObj1 = new Image();
          imageObj1.src = image;
          imageObj1.onload = function OnLoad() {
            if (endY - initialY > 0 && endX - initialX > 0) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(
                imageObj1,
                initialX,
                initialY,
                endX - initialX,
                endY - initialY,
                0,
                0,
                width,
                height
              );
              const scaleX = canvas.width / (endX - initialX);
              const scaleY = canvas.height / (endY - initialY);
              ctx.scale(scaleX, scaleY);
            }
          };
        }
      }
    } else {
      createImage();
    }
  }, [
    data,
    hasZoomed,
    endX,
    endY,
    initialX,
    initialY,
    width,
    height,
    canvasRef,
    drawImage,
  ]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!disableZoom) {
      setIsDown(true);
      setinitialX(event.nativeEvent.offsetX);
      setInitialY(event.nativeEvent.offsetY);
    }
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (isDown) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const mousex = event.nativeEvent.offsetX;
        const mousey = event.nativeEvent.offsetY;

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawImage(ctx);
          ctx.beginPath();
          ctx.rect(initialX, initialY, mousex - initialX, mousey - initialY);
          ctx.setLineDash([6]);
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }
  };

  const handleMouseUp = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!disableZoom) {
      setIsDown(false);
      setEndX(event.nativeEvent.offsetX);
      setEndY(event.nativeEvent.offsetY);
      setHasZoomed(true);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={(e) => {
        handleMouseDown(e);
      }}
      onMouseMove={(e) => {
        handleMouseMove(e);
      }}
      onMouseUp={(e) => {
        handleMouseUp(e);
      }}
    />
  );
};
