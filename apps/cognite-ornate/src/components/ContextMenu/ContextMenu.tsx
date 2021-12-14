import { Button, Menu } from '@cognite/cogs.js';
import { useEffect, useRef, useState, useCallback } from 'react';
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
import { getAlignCenterPositionX } from './ContextMenuItems/utils';

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
    getAlignCenterPositionX(
      selectedNode.getClientRect().x,
      selectedNode.getClientRect().width,
      ref.current?.clientWidth || 0
    )
  );
  const [y, setY] = useState<number>(selectedNode.getClientRect().y);
  const [fill, setFill] = useState<boolean>(false);
  const [toggleStyleMenu, setToggleStyleMenu] = useState<boolean>(false);

  useEffect(() => {
    document.addEventListener('wheel', onMouseWheel);
    return () => {
      document.removeEventListener('wheel', onMouseWheel);
    };
  }, [selectedNode]);

  useEffect(() => {
    setX(
      getAlignCenterPositionX(
        selectedNode.getClientRect().x,
        selectedNode.getClientRect().width,
        ref.current?.clientWidth || 0
      )
    );
    setY(selectedNode.getClientRect().y);
  }, [selectedNode]);

  useEffect(() => {
    // We need to reposition the contextmenu whenever the stage view moves
    setX(
      getAlignCenterPositionX(
        selectedNode.getClientRect().x,
        selectedNode.getClientRect().width,
        ref.current?.clientWidth || 0
      )
    );
  }, [ref.current?.clientWidth]);

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

  const onMouseWheel = () => {
    const { x: newX, y: newY, width } = selectedNode.getClientRect();
    setX(getAlignCenterPositionX(newX, width, ref.current?.clientWidth || 0));
    setY(newY);
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
  }, [selectedNode.attrs.type]);

  const commonMenuItems = getMenuItems();

  return (
    <ContextMenuWrapper
      ref={ref}
      style={{ transform: `translate(${x}px, ${y}px)` }}
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
