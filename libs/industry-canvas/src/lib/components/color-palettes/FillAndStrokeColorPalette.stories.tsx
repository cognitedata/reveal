import { ComponentStory } from '@storybook/react';
import { useState } from 'react';
import { FillAndStrokeColorPalette } from './FillAndStrokeColorPalette';

export default {
  title: 'Tooltips/Color Palettes/Fill And Stroke Color Palette Story',
  component: FillAndStrokeColorPalette,
};

export const FillAndStrokeColorPaletteStory: ComponentStory<
  typeof FillAndStrokeColorPalette
> = () => {
  const [selectedFillColor, setSelectedFillColor] = useState('red');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState('red');
  return (
    <FillAndStrokeColorPalette
      fillColors={['red', 'green', 'blue']}
      selectedFillColor={selectedFillColor}
      onUpdateFillColor={setSelectedFillColor}
      strokeColors={['red', 'green', 'blue']}
      selectedStrokeColor={selectedStrokeColor}
      onUpdateStrokeColor={setSelectedStrokeColor}
    />
  );
};
