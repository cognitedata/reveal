import React from 'react';
import Konva from 'konva';
import { Menu } from '@cognite/cogs.js';
import Color from 'color';

import { ColorPicker } from '../../ColorPicker';

import { StyledImageColoroizer } from './elements';

interface Props {
  selectedNode: Konva.Node;
}

const hexToInvertedRgb = (hexColor: string) => {
  const newColor = Color(hexColor, 'hex').rgb();
  return [
    { color: 'red', value: 255 - newColor.red() },
    { color: 'green', value: 255 - newColor.green() },
    { color: 'blue', value: 255 - newColor.blue() },
  ] as const;
};

export const ImageColoroizer: React.VFC<Props> = ({ selectedNode }) => {
  const handleChange = (hexColor: string) => {
    const revertedColors = hexToInvertedRgb(hexColor);
    selectedNode.cache();
    selectedNode.filters([
      Konva.Filters.Invert,
      Konva.Filters.RGB,
      Konva.Filters.Invert,
    ]);

    revertedColors.forEach((color) => selectedNode[color.color](color.value));
  };

  return (
    <StyledImageColoroizer>
      <Menu>
        <Menu.Header>Colorize image</Menu.Header>
        <ColorPicker color="#ff0000" onColorChange={handleChange} />
      </Menu>
    </StyledImageColoroizer>
  );
};
