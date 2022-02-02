import React from 'react';
import { Menu } from '@cognite/cogs.js';

import { ColorPicker } from '../../ColorPicker';

type ColorControlProps = {
  header: string;
  color: string;
  onColorChange: (newColor: string) => void;
};

const ColorControl = ({ header, color, onColorChange }: ColorControlProps) => {
  return (
    <>
      <Menu.Header>{header}</Menu.Header>
      <ColorPicker color={color} onColorChange={onColorChange} />
    </>
  );
};

export default ColorControl;
