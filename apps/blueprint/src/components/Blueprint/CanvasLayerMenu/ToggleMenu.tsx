import React, { useState } from 'react';
import { Menu } from '@cognite/cogs.js';

import { AnnotationIcon, DrawingIcon } from './elements';

export type CanvasToggleLayerMenuProps = {
  handleToggleLayers: (layer: string, isVisible: boolean) => void;
};

export const ToggleMenu: React.FC<CanvasToggleLayerMenuProps> = ({
  handleToggleLayers,
}) => {
  const [layerStatus, setLayerStatus] = useState<Record<string, boolean>>({
    annotation: true,
    drawing: true,
  });

  const onToggleLayer = (layer: string) => {
    handleToggleLayers(layer, !layerStatus[layer]);
    setLayerStatus((prev: Record<string, boolean>) => ({
      ...prev,
      [layer]: !layerStatus[layer],
    }));
  };

  const styleItem = (visible: boolean) => {
    const style = {
      marginRight: 16,
      filter: '',
      opacity: 1,
    };
    if (!visible) {
      style.filter = 'grayscale(1)';
      style.opacity = 0.66;
    }
    return style;
  };

  return (
    <Menu>
      <Menu.Header>Click to turn on / off</Menu.Header>
      <Menu.Item
        onClick={() => {
          onToggleLayer('annotation');
        }}
        style={styleItem(layerStatus.annotation)}
      >
        <AnnotationIcon style={{ marginRight: 8 }} />
        Annotations
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          onToggleLayer('drawing');
        }}
        style={styleItem(layerStatus.drawing)}
      >
        <DrawingIcon style={{ marginRight: 8 }} />
        Drawings
      </Menu.Item>
    </Menu>
  );
};
