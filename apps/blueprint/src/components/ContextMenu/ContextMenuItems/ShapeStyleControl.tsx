import React, { useState, useEffect, ChangeEvent } from 'react';
import { Menu } from '@cognite/cogs.js';
import { Metrics } from '@cognite/metrics';
import Konva from 'konva';
import { Node, NodeConfig } from 'konva/lib/Node';
import { UpdateKeyType } from '@cognite/ornate';
import Color from 'color';
import { defaultColorTransparent } from 'consts';

import { ColorControl, OpacityControl } from '.';
import { ShapeStyleControlWrapper } from './elements';
import { getInitialOpacity } from './utils';

type ShapeStyleControllProps = {
  selectedNode: Konva.Node;
  metrics: Metrics;
  fill?: boolean;
  updateShape: (
    shape: Node<NodeConfig>,
    updateKey: UpdateKeyType,
    updateValue: string | number
  ) => void;
};

type StyleSettings = {
  stroke: string;
  fill: string;
  opacity: number;
};

const ShapeStyleControl = ({
  selectedNode,
  metrics,
  fill,
  updateShape,
}: ShapeStyleControllProps) => {
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    stroke: selectedNode.getAttr('stroke'),
    fill: selectedNode.getAttr('fill'),
    opacity: getInitialOpacity(selectedNode, fill),
  });
  const fillOrStroke = fill ? 'fill' : 'stroke';

  useEffect(() => {
    const color = styleSettings[fillOrStroke]
      ? new Color(styleSettings[fillOrStroke])
      : defaultColorTransparent;
    setStyleSettings({
      ...styleSettings,
      opacity: color.alpha(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill]);

  const onOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onOpacityChange', { value: e.target.value });
    const newColor = new Color(selectedNode.getAttr(fillOrStroke));
    const opacity = Number(e.target.value);
    setStyleSettings({
      ...styleSettings,
      [fillOrStroke]: newColor.alpha(opacity),
      opacity: opacity || 0,
    });
    updateShape(selectedNode, fillOrStroke, newColor.alpha(opacity).string());
  };

  const onColorChange = (newColor: string) => {
    metrics.track('onColorChange', { color: newColor });
    const newColorObj = new Color(newColor);
    setStyleSettings({
      ...styleSettings,
      [fillOrStroke]: newColor,
    });
    updateShape(
      selectedNode,
      fillOrStroke,
      newColorObj.alpha(styleSettings.opacity).string()
    );
  };

  return (
    <ShapeStyleControlWrapper>
      <Menu className="ornate-stroke-style-menu">
        <OpacityControl
          header={`${fill ? 'Fill' : 'Stroke'} Opacity`}
          onOpacityChange={onOpacityChange}
          opacity={styleSettings.opacity}
        />
        <ColorControl
          header={`${fill ? 'Fill' : 'Stroke'} Color`}
          color={styleSettings[fillOrStroke]}
          onColorChange={onColorChange}
        />
      </Menu>
    </ShapeStyleControlWrapper>
  );
};

export default ShapeStyleControl;
