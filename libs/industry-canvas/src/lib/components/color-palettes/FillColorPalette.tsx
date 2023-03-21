import { Button, ToolBar } from '@cognite/cogs.js';
import React from 'react';
import { FillIcon } from './FillIcon';

export type FillColorPaletteTooltipProps = {
  colors: string[];
  selectedColor: string | undefined;
  onUpdateColor: (color: string) => void;
};

export const FillColorPalette: React.FC<FillColorPaletteTooltipProps> = ({
  colors,
  selectedColor,
  onUpdateColor,
}) => {
  // NOTE: Since we can't pass an SVG directly to the Cogs.js Button component or to the ToolBarButton component,
  //       we have create our own SVG icon components and pass them to the Cogs.js Button component.
  //       Ideally, Cogs.js should allow us to pass an SVG directly to the Button component.
  return (
    <ToolBar direction="horizontal">
      <>
        {colors.map((color) => (
          <Button
            key={color}
            className="cogs-button--icon-only"
            aria-label={`Fill color ${color}`}
            type={selectedColor === color ? 'secondary' : 'ghost'}
            onClick={() => onUpdateColor(color)}
          >
            <i className="cogs-icon">
              <FillIcon color={color} />
            </i>
          </Button>
        ))}
      </>
    </ToolBar>
  );
};
