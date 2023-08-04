import { useState } from 'react';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';

import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
} from '../../colors';
import { translationKeys } from '../../common';
import { UseOnUpdateSelectedAnnotationReturnType } from '../../hooks/useOnUpdateSelectedAnnotation';
import { useTranslation } from '../../hooks/useTranslation';
import { ShapeAnnotation } from '../../types';
import { FillButton } from '../color-palettes/FillButton';
import { FillColorPalette } from '../color-palettes/FillColorPalette';
import { StrokeButton } from '../color-palettes/StrokeButton';
import { StrokeColorPalette } from '../color-palettes/StrokeColorPalette';

import { RightAlignedColorPalettePosition } from './elements';

export type ShapeAnnotationTooltipProps = {
  shapeAnnotation: ShapeAnnotation;
  onDeleteSelectedCanvasAnnotation: () => void;
} & UseOnUpdateSelectedAnnotationReturnType;

enum EditMode {
  FILL = 'fill',
  STROKE = 'stroke',
}

export const ShapeAnnotationTooltip: React.FC<ShapeAnnotationTooltipProps> = ({
  shapeAnnotation,
  onUpdateSelectedAnnotation,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [editMode, setEditMode] = useState<EditMode | undefined>(undefined);
  const { t } = useTranslation();

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
              onUpdateSelectedAnnotation({
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
              onUpdateSelectedAnnotation({
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
              color={
                shapeAnnotation.style?.stroke ??
                SHAPE_ANNOTATION_STROKE_COLOR_MAP.YELLOW
              }
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
              color={
                shapeAnnotation.style?.fill ??
                SHAPE_ANNOTATION_FILL_COLOR_MAP.BLUE
              }
              isToggled={isEditingFill}
              ariaLabel="Edit fill color"
              onClick={() => {
                setEditMode(isEditingFill ? undefined : EditMode.FILL);
              }}
            />
          </Tooltip>
        </>

        <Tooltip content={t(translationKeys.REMOVE, 'Remove')}>
          <Button
            icon="Delete"
            type="ghost"
            aria-label={t(translationKeys.REMOVE, 'Remove')}
            onClick={onDeleteSelectedCanvasAnnotation}
          />
        </Tooltip>
      </ToolBar>
    </>
  );
};
