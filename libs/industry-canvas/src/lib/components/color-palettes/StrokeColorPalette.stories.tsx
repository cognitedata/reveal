import { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import { StrokeColorPalette } from './StrokeColorPalette';

export default {
  title: 'Tooltips/Color Palettes/Stroke Color Palette Story',
  component: StrokeColorPalette,
};

export const StrokeColorPaletteStory: ComponentStory<
  typeof StrokeColorPalette
> = () => {
  const [selectedColor, setSelectedColor] = useState('red');
  return (
    <StrokeColorPalette
      colors={['transparent', 'red', 'green', 'blue']}
      selectedColor={selectedColor}
      onUpdateColor={setSelectedColor}
    />
  );
};
