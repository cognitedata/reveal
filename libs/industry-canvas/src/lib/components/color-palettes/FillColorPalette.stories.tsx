import { ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { FillColorPalette } from './FillColorPalette';

export default {
  title: 'Tooltips/Color Palettes/Fill Color Palette Story',
  component: FillColorPalette,
};

export const FillColorPaletteStory: ComponentStory<
  typeof FillColorPalette
> = () => {
  const [selectedColor, setSelectedColor] = useState('red');
  return (
    <FillColorPalette
      colors={['red', 'green', 'blue']}
      selectedColor={selectedColor}
      onUpdateColor={setSelectedColor}
    />
  );
};
