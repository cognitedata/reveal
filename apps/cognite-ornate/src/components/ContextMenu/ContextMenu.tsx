import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import Konva from 'konva';
import { useMetrics } from '@cognite/metrics';
import { Node, NodeConfig } from 'konva/lib/Node';
import { UpdateKeyType } from '@cognite/ornate';

import {
  ThicknessControl,
  FontSizeControl,
  ShapeStyleControl,
} from './ContextMenuItems';
import { ContextMenuWrapper } from './elements';
import { getPositionX } from './ContextMenuItems/utils';

const SQUARE_WIDTH = 32;
const SQUARE_HEIGHT = 32;

type ContextMenuProps = {
  selectedNode: Konva.Node;
  menuItems?: React.Component[];
  updateShape: (
    shape: Node<NodeConfig>,
    updateKey: UpdateKeyType,
    updateValue: string | number
  ) => void;
};

const ContextMenu = ({
  selectedNode,
  menuItems,
  updateShape,
}: ContextMenuProps) => {
  const metrics = useMetrics('ContextMenu');
  const ref = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number>(
    getPositionX(
      selectedNode.getClientRect().x,
      selectedNode.getClientRect().width,
      ref.current?.clientWidth || 0,
      selectedNode.getType() === 'Group'
    )
  );
  const [y, setY] = useState<number>(selectedNode.getClientRect().y);
  const [fill, setFill] = useState<boolean>(false);
  const [toggleStyleMenu, setToggleStyleMenu] = useState<boolean>(false);
  const [hide, setHide] = useState<boolean>(false);

  const onMouseWheel = useCallback(() => {
    const { x: newX, y: newY, width } = selectedNode.getClientRect();
    setX(
      getPositionX(
        newX,
        width,
        ref.current?.clientWidth || 0,
        selectedNode.getType() === 'Group'
      )
    );
    setY(newY);
  }, [selectedNode]);

  useEffect(() => {
    document.addEventListener('wheel', onMouseWheel);
    return () => {
      document.removeEventListener('wheel', onMouseWheel);
    };
  }, [selectedNode, onMouseWheel]);

  useEffect(() => {
    // Set drag event listener to hide the context menu accordingly
    selectedNode.on('dragstart', () => {
      setHide(true);
    });
    selectedNode.on('dragend', () => {
      const { x, width, y } = selectedNode.getClientRect();
      setHide(false);
      const newX = getPositionX(
        x,
        width,
        ref.current?.clientWidth || 0,
        selectedNode.getType() === 'Group'
      );
      setX(newX);
      setY(y);

      const markers = selectedNode
        .getParent()
        .getChildren()
        .filter((node) => node.attrs.name === 'marker');

      if (markers?.length > 0) {
        const attachedMarker = markers.find(
          (marker) => marker.attrs.attachedToShape === selectedNode.attrs.id
        ) as Konva.Group;
        if (attachedMarker) {
          attachedMarker.children?.forEach((child) => {
            if (child.attrs.text) {
              child.setAttrs({
                ...attachedMarker.attrs,
                x: selectedNode.attrs.x - (SQUARE_WIDTH - SQUARE_WIDTH / 4),
                y: selectedNode.attrs.y - (SQUARE_HEIGHT - SQUARE_HEIGHT / 8),
              });
            } else {
              child.setAttrs({
                ...attachedMarker.attrs,
                x: selectedNode.attrs.x - SQUARE_WIDTH,
                y: selectedNode.attrs.y - SQUARE_HEIGHT,
              });
            }
          });
        }
      }
    });
    return () => {
      selectedNode.off('dragstart');
      selectedNode.off('dragend');
    };
  }, [selectedNode]);

  useEffect(() => {
    // We need to reposition the contextmenu whenever the stage view moves
    setX(
      getPositionX(
        selectedNode.getClientRect().x,
        selectedNode.getClientRect().width,
        ref.current?.clientWidth || 0,
        selectedNode.getType() === 'Group'
      )
    );
    setY(selectedNode.getClientRect().y);
  }, [selectedNode]);

  const toggleFillStyleMenu = () => {
    if (!toggleStyleMenu) {
      setToggleStyleMenu(!toggleStyleMenu);
    }
    setFill(true);
  };
  const toggleStrokeStyleMenu = () => {
    if (!toggleStyleMenu) {
      setToggleStyleMenu(!toggleStyleMenu);
    }
    setFill(false);
  };

  const thicknessControl = (
    <ThicknessControl
      selectedNode={selectedNode}
      metrics={metrics}
      updateShape={updateShape}
    />
  );

  const strokeControlButton = (
    <Button
      type="ghost"
      aria-label="strokeControlButton"
      icon="Experiment"
      onClick={toggleStrokeStyleMenu}
    />
  );

  const fillControlButton = (
    <Button
      type="ghost"
      aria-label="fillControlButton"
      icon="ColorPalette"
      onClick={toggleFillStyleMenu}
    />
  );

  const fontSizeControl = (
    <FontSizeControl
      selectedNode={selectedNode}
      metrics={metrics}
      updateShape={updateShape}
    />
  );

  const getMenuItems = useCallback(() => {
    switch (selectedNode.attrs.type) {
      case 'text':
        return [fontSizeControl, fillControlButton];
      case 'line':
        return [thicknessControl, strokeControlButton];
      case 'circle':
      case 'rect':
        return [thicknessControl, strokeControlButton, fillControlButton];
      default:
        return undefined;
    }
  }, [
    selectedNode,
    fontSizeControl,
    fillControlButton,
    thicknessControl,
    strokeControlButton,
  ]);

  const commonMenuItems = getMenuItems();

  // come up with a better system.
  const groupStyles = { marginTop: '-38px' };

  return (
    <ContextMenuWrapper
      ref={ref}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        ...(selectedNode.getType() === 'Group' && groupStyles),
        ...(hide && { display: 'none' }),
      }}
    >
      {toggleStyleMenu && (
        <ShapeStyleControl
          selectedNode={selectedNode}
          metrics={metrics}
          fill={fill}
          updateShape={updateShape}
        />
      )}
      {(commonMenuItems || menuItems) && (
        <Menu className="ornate-context-menu">
          {commonMenuItems}
          {menuItems}
        </Menu>
      )}
    </ContextMenuWrapper>
  );
};

export default ContextMenu;
