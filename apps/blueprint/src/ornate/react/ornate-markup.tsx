import Konva from 'konva';
import { useEffect, useState, useContext, useCallback, useRef } from 'react';

import { OrnateContext } from './ornate.context';

export type OrnateMarkupProps = {
  shapeId: string;
  component: JSX.Element;
  placement?:
    | 'TOP-LEFT'
    | 'TOP'
    | 'TOP-RIGHT'
    | 'BOTTOM-LEFT'
    | 'BOTTOM'
    | 'BOTTOM-RIGHT'
    | 'LEFT'
    | 'RIGHT'
    | 'CENTER';
};

export const OrnateMarkup = ({
  shapeId,
  component,
  placement = 'TOP',
}: OrnateMarkupProps) => {
  const { ornateInstance } = useContext(OrnateContext);
  const [position, setPosition] = useState<[number, number]>();
  const nodeRef = useRef<Konva.Node>();

  const updatePosition = useCallback(() => {
    if (!nodeRef.current) return;

    if (nodeRef.current.parent === null) {
      // This node has been removed! Try to find it again
      const node = ornateInstance?.stage.findOne(`#${shapeId}`);

      nodeRef.current = node;
      if (!nodeRef.current) {
        // eslint-disable-next-line no-console
        console.warn('Node no longer exists');
        setPosition([-9999, -9999]);
        return;
      }
    }

    const box = nodeRef.current.getClientRect();
    let x = box.x + box.width / 2;
    let y = box.y + box.height / 2;
    if (placement.includes('TOP')) {
      y = box.y;
    }
    if (placement.includes('BOTTOM')) {
      y = box.y + box.height;
    }

    if (placement.includes('LEFT')) {
      x = box.x;
    }
    if (placement.includes('RIGHT')) {
      x = box.x + box.width;
    }

    setPosition([x, y]);
  }, [ornateInstance?.stage, placement, shapeId]);

  useEffect(() => {
    if (!ornateInstance?.stage) return;
    const node = ornateInstance.stage.findOne(`#${shapeId}`);

    nodeRef.current = node;
    updatePosition();
  }, [shapeId, ornateInstance?.stage, updatePosition]);

  useEffect(() => {
    if (!ornateInstance?.stage) return () => null;
    const handleMovement = () => {
      updatePosition();
    };

    ornateInstance.stage.on('zoomed', handleMovement);
    ornateInstance.stage.on('wheel', handleMovement);
    ornateInstance.transformer.on('dragend transformend', handleMovement);
    ornateInstance.stage.on('dragmove transformmove', handleMovement);
    return () => {
      ornateInstance.stage.off('zoomed', handleMovement);
      ornateInstance.stage.off('wheel', handleMovement);
      ornateInstance.transformer.off('dragend transformend', handleMovement);
      ornateInstance.stage.off('dragmove transformmove', handleMovement);
    };
  }, [updatePosition, ornateInstance?.stage, ornateInstance?.transformer]);

  if (!position) {
    return null;
  }

  return (
    <div
      style={{
        transform: `translate(${position[0]}px, ${position[1]}px) translate(-50%, -50%)`,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {component}
    </div>
  );
};
