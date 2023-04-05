import { ToolBar } from '@cognite/cogs.js';
import React from 'react';
import { StrokeButton } from './StrokeButton';

export type StrokeColorPaletteTooltipProps = {
  colors: string[];
  selectedColor: string | undefined;
  onUpdateColor: (color: string) => void;
};

export const StrokeColorPalette: React.FC<StrokeColorPaletteTooltipProps> = ({
  colors,
  selectedColor,
  onUpdateColor,
}) => {
  return (
    <ToolBar direction="horizontal">
      <>
        {colors.map((color) => (
          <StrokeButton
            color={color}
            isToggled={selectedColor === color}
            onClick={() => onUpdateColor(color)}
            key={color}
            ariaLabel={`Stroke color ${color}`}
          />
        ))}
      </>
    </ToolBar>
  );
};
