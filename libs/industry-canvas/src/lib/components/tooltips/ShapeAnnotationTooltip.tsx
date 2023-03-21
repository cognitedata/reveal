import { useState } from 'react';
import { Button, ToolBar } from '@cognite/cogs.js';
import { RectangleAnnotation } from '@cognite/unified-file-viewer';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import { FillAndStrokeColorPalette } from '../color-palettes/FillAndStrokeColorPalette';
import { RightAlignedColorPalettePosition } from './elements';
import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
} from '../../colors';

export type ShapeAnnotationTooltipProps = {
  shapeAnnotation: RectangleAnnotation;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
  onDeleteSelectedCanvasAnnotation: () => void;
};

export const ShapeAnnotationTooltip: React.FC<ShapeAnnotationTooltipProps> = ({
  shapeAnnotation,
  onUpdateAnnotationStyleByType,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [isInEditMode, setIsInEditMode] = useState(false);

  return (
    <>
      {isInEditMode && (
        <RightAlignedColorPalettePosition>
          <FillAndStrokeColorPalette
            fillColors={Object.values(SHAPE_ANNOTATION_FILL_COLOR_MAP)}
            selectedFillColor={shapeAnnotation.style?.fill}
            onUpdateFillColor={(color) => {
              onUpdateAnnotationStyleByType({
                shape: { fill: color },
              });
            }}
            strokeColors={Object.values(SHAPE_ANNOTATION_STROKE_COLOR_MAP)}
            selectedStrokeColor={shapeAnnotation.style?.stroke}
            onUpdateStrokeColor={(color) => {
              onUpdateAnnotationStyleByType({
                shape: { stroke: color },
              });
            }}
          />
        </RightAlignedColorPalettePosition>
      )}
      <ToolBar direction="horizontal">
        <Button
          icon="ColorPalette"
          type={isInEditMode ? 'secondary' : 'ghost'}
          aria-label="Edit color"
          onClick={() => {
            setIsInEditMode((prev) => !prev);
          }}
        />
        <Button
          icon="Delete"
          type="ghost"
          aria-label="Delete annotation"
          onClick={onDeleteSelectedCanvasAnnotation}
        />
      </ToolBar>
    </>
  );
};
