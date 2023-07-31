import React from 'react';
import Konva from 'konva';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import chroma from 'chroma-js';

import { ColorPicker } from '../../color-picker';

import { ControlProps } from './types';

const hexToInvertedRgb = (hexColor: string) => {
  const newColor = chroma(hexColor).rgb();
  return [
    { color: 'red', value: 255 - newColor[0] },
    { color: 'green', value: 255 - newColor[1] },
    { color: 'blue', value: 255 - newColor[2] },
  ] as const;
};

export const ColorizeControlDropdown: React.VFC<ControlProps> = ({
  instance,
  nodes,
}) => {
  const handleChange = (hexColor: string) => {
    const revertedColors = hexToInvertedRgb(hexColor);
    nodes.forEach((node) => {
      node.cache();
      node.filters([
        Konva.Filters.Invert,
        Konva.Filters.RGB,
        Konva.Filters.Invert,
      ]);
      revertedColors.forEach((color) => node[color.color](color.value));
    });
    instance.emitSaveEvent();
  };

  return (
    <Menu>
      <Menu.Header>Colorize image</Menu.Header>
      <ColorPicker color="#ff0000" onColorChange={handleChange} />
    </Menu>
  );
};

export const ColorizeControl: React.VFC<ControlProps> = (props) => {
  return (
    <Dropdown content={<ColorizeControlDropdown {...props} />}>
      <Button type="ghost">Colorize</Button>
    </Dropdown>
  );
};
