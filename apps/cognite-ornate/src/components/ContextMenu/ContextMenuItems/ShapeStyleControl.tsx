import { Menu } from '@cognite/cogs.js';
import { Metrics } from '@cognite/metrics';
import Konva from 'konva';
import { useState, useEffect, ChangeEvent } from 'react';
import { ColorResult } from 'react-color';

import { ColorControl, OpacityControl } from '.';
import { ShapeStyleControlWrapper } from './elements';
import {
  defaultColorTransparent,
  getInitialOpacity,
  getOpacityFromRGBA,
  getRGBAString,
  hexToRGBA,
  isHexColor,
  setOpacityFromRGBA,
} from './utils';

type ShapeStyleControllProps = {
  selectedNode: Konva.Node;
  metrics: Metrics;
  fill?: boolean;
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
}: ShapeStyleControllProps) => {
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    stroke: selectedNode.getAttr('stroke'),
    fill: selectedNode.getAttr('fill'),
    opacity: getInitialOpacity(selectedNode, fill),
  });

  useEffect(() => {
    setStyleSettings({
      ...styleSettings,
      opacity: getInitialOpacity(selectedNode, fill),
    });
  }, [fill]);

  const onOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
    metrics.track('onOpacityChange', { value: e.target.value });
    const fillOrStroke = fill ? 'fill' : 'stroke';
    const oldColor = isHexColor(styleSettings[fillOrStroke])
      ? (hexToRGBA(styleSettings[fillOrStroke], true) as string)
      : styleSettings[fillOrStroke];
    const newColor = setOpacityFromRGBA(
      oldColor || defaultColorTransparent,
      e.target.value
    );
    setStyleSettings({
      ...styleSettings,
      [fillOrStroke]: newColor,
      opacity: Number(e.target.value),
    });
    selectedNode.setAttr(fillOrStroke, newColor);
  };

  const onColorChange = (color: ColorResult) => {
    metrics.track('onColorChange', { color: color.rgb });
    const { r, g, b, a } = color.rgb;
    const fillOrStroke = fill ? 'fill' : 'stroke';
    const opacity = styleSettings[fillOrStroke]
      ? getOpacityFromRGBA(selectedNode.getAttr(fillOrStroke))
      : a;
    const newColor = getRGBAString(r, g, b, opacity || 1);
    setStyleSettings({
      ...styleSettings,
      [fillOrStroke]: newColor,
      opacity: opacity || 1,
    });
    selectedNode.setAttr(fillOrStroke, newColor);
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
          color={fill ? styleSettings.fill : styleSettings.stroke}
          onColorChange={onColorChange}
        />
      </Menu>
    </ShapeStyleControlWrapper>
  );
};

export default ShapeStyleControl;
