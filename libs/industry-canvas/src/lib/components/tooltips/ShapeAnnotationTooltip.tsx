import { useState } from 'react';
import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
} from '../../colors';
import { StrokeColorPalette } from '../color-palettes/StrokeColorPalette';
import { FillColorPalette } from '../color-palettes/FillColorPalette';
import { FillButton } from '../color-palettes/FillButton';
import { StrokeButton } from '../color-palettes/StrokeButton';
import { ShapeAnnotation } from '../../types';
import { RightAlignedColorPalettePosition } from './elements';

export type ShapeAnnotationTooltipProps = {
  shapeAnnotation: ShapeAnnotation;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
  onDeleteSelectedCanvasAnnotation: () => void;
};

enum EditMode {
  FILL = 'fill',
  STROKE = 'stroke',
}

export const ShapeAnnotationTooltip: React.FC<ShapeAnnotationTooltipProps> = ({
  shapeAnnotation,
  onUpdateAnnotationStyleByType,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [editMode, setEditMode] = useState<EditMode | undefined>(undefined);

  const isEditingStroke = editMode === EditMode.STROKE;
  const isEditingFill = editMode === EditMode.FILL;

  return (
    <>
      {isEditingStroke && (
        <RightAlignedColorPalettePosition>
          <StrokeColorPalette
            colors={Object.values(SHAPE_ANNOTATION_STROKE_COLOR_MAP)}
            selectedColor={shapeAnnotation.style?.stroke}
            onUpdateColor={(color) => {
              onUpdateAnnotationStyleByType({
                shape: { stroke: color },
              });
            }}
          />
        </RightAlignedColorPalettePosition>
      )}

      {isEditingFill && (
        <RightAlignedColorPalettePosition>
          <FillColorPalette
            colors={Object.values(SHAPE_ANNOTATION_FILL_COLOR_MAP)}
            selectedColor={shapeAnnotation.style?.fill}
            onUpdateColor={(color) => {
              onUpdateAnnotationStyleByType({
                shape: { fill: color },
              });
            }}
          />
        </RightAlignedColorPalettePosition>
      )}

      <ToolBar direction="horizontal">
        <>
          <Tooltip
            content={isEditingStroke ? 'Close color palette' : 'Change color'}
          >
            <StrokeButton
              color={SHAPE_ANNOTATION_STROKE_COLOR_MAP.YELLOW}
              isToggled={isEditingStroke}
              ariaLabel="Edit stroke color"
              onClick={() => {
                setEditMode(isEditingStroke ? undefined : EditMode.STROKE);
              }}
            />
          </Tooltip>

          <Tooltip
            content={isEditingFill ? 'Close color palette' : 'Change color'}
          >
            <FillButton
              color={SHAPE_ANNOTATION_FILL_COLOR_MAP.BLUE}
              isToggled={isEditingFill}
              ariaLabel="Edit fill color"
              onClick={() => {
                setEditMode(isEditingFill ? undefined : EditMode.FILL);
              }}
            />
          </Tooltip>
        </>

        <Tooltip content="Remove">
          <Button
            icon="Delete"
            type="ghost"
            aria-label="Remove annotation"
            onClick={onDeleteSelectedCanvasAnnotation}
          />
        </Tooltip>
      </ToolBar>
    </>
  );
};
