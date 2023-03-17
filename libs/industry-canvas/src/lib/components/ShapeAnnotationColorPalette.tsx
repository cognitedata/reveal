import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { ShapeAnnotationStyle } from '../hooks/useManagedTools';
import { ShapeAnnotationColor } from '../types';
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter';
import {
  fillShapeAnnotationColorToHex,
  strokeShapeAnnotationColorToHex,
} from '../utils/colorUtils';

export type ColorPaletteTooltipProps = {
  shapeAnnotationStyle: ShapeAnnotationStyle;
  onUpdateShapeAnnotationStyle: (
    updateShapeAnnotationStyle: Partial<ShapeAnnotationStyle>
  ) => void;
};

export const ColorPaletteTooltip: React.FC<ColorPaletteTooltipProps> = ({
  shapeAnnotationStyle,
  onUpdateShapeAnnotationStyle,
}) => {
  const FillColorButtonGroup = Object.keys(ShapeAnnotationColor)
    .map(
      (color) =>
        ShapeAnnotationColor[color as keyof typeof ShapeAnnotationColor]
    ) // TODO: Fix this type cast
    .map(
      (color): ToolBarButton => ({
        icon: 'Circle',
        style:
          shapeAnnotationStyle.fill === color
            ? { border: '1px solid black' }
            : undefined,
        onClick: () => onUpdateShapeAnnotationStyle({ fill: color }),
        description: `${capitalizeFirstLetter(color)} fill`,
        'aria-label': `${capitalizeFirstLetter(color)} fill`,
        color: fillShapeAnnotationColorToHex(color), // TODO: This doesn't seem to do anything. We need to add colors somehow
      })
    );

  const StrokeColorButtonGroup = Object.keys(ShapeAnnotationColor)
    .map(
      (color) =>
        ShapeAnnotationColor[color as keyof typeof ShapeAnnotationColor]
    ) // TODO: Fix this type cast
    .map(
      (color): ToolBarButton => ({
        icon: 'Circle',
        style:
          shapeAnnotationStyle.stroke === color
            ? { border: '1px solid black' }
            : undefined,
        onClick: () => onUpdateShapeAnnotationStyle({ stroke: color }),
        description: `${capitalizeFirstLetter(color)} stroke`,
        'aria-label': `${capitalizeFirstLetter(color)} stroke`,
        color: strokeShapeAnnotationColorToHex(color), // TODO: This doesn't seem to do anything. We need to add colors somehow
      })
    );

  return (
    <ToolBar direction="horizontal">
      <ToolBar.ButtonGroup buttonGroup={FillColorButtonGroup} />
      <ToolBar.ButtonGroup buttonGroup={StrokeColorButtonGroup} />
    </ToolBar>
  );
};
