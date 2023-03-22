import { Button, ToolBar } from '@cognite/cogs.js';
import { StrokeIcon } from './StrokeIcon';
import { FillIcon } from './FillIcon';

export type FillAndStrokeColorPaletteProps = {
  fillColors: string[];
  selectedFillColor: string | undefined;
  onUpdateFillColor: (color: string) => void;
  strokeColors: string[];
  selectedStrokeColor: string | undefined;
  onUpdateStrokeColor: (color: string) => void;
};

export const FillAndStrokeColorPalette: React.FC<
  FillAndStrokeColorPaletteProps
> = ({
  fillColors,
  selectedFillColor,
  onUpdateFillColor,
  strokeColors,
  selectedStrokeColor,
  onUpdateStrokeColor,
}) => {
  // NOTE: Since we can't pass an SVG directly to the Cogs.js Button component or to the ToolBarButton component,
  //       we have create our own SVG icon components and pass them to the Cogs.js Button component.
  //       Ideally, Cogs.js should allow us to pass an SVG directly to the Button component.
  return (
    <ToolBar direction="horizontal">
      <>
        {fillColors.map((color) => (
          <Button
            key={color}
            className="cogs-button--icon-only"
            aria-label={`Fill color ${color}`}
            type={selectedFillColor === color ? 'secondary' : 'ghost'}
            onClick={() => onUpdateFillColor(color)}
          >
            <i className="cogs-icon">
              <FillIcon color={color} />
            </i>
          </Button>
        ))}
      </>
      <>
        {strokeColors.map((color) => (
          <Button
            key={color}
            className="cogs-button--icon-only"
            aria-label={`Stroke color ${color}`}
            type={selectedStrokeColor === color ? 'secondary' : 'ghost'}
            onClick={() => onUpdateStrokeColor(color)}
          >
            <i className="cogs-icon">
              <StrokeIcon color={color} />
            </i>
          </Button>
        ))}
      </>
    </ToolBar>
  );
};
