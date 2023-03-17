import { Button, ToolBar } from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components';
import {
  ColorPaletteTooltip,
  ColorPaletteTooltipProps,
} from './ShapeAnnotationColorPalette';

export type ShapeAnnotationTooltipProps = {
  onDeleteSelectedCanvasAnnotation: () => void;
} & ColorPaletteTooltipProps;

export const ShapeAnnotationTooltip: React.FC<ShapeAnnotationTooltipProps> = ({
  onDeleteSelectedCanvasAnnotation,
  shapeAnnotationStyle,
  onUpdateShapeAnnotationStyle,
}) => {
  const [isInEditMode, setIsInEditMode] = useState(false);

  return (
    <div style={{ marginBottom: '10px' }}>
      {isInEditMode && (
        <AbsoluteDiv>
          <ColorPaletteTooltip
            shapeAnnotationStyle={shapeAnnotationStyle}
            onUpdateShapeAnnotationStyle={onUpdateShapeAnnotationStyle}
          />
        </AbsoluteDiv>
      )}
      <ToolBar direction="horizontal">
        <Button
          icon="ColorPalette"
          type={isInEditMode ? 'secondary' : 'ghost'}
          onClick={() => {
            setIsInEditMode((prev) => !prev);
          }}
        />
        <Button
          icon="Delete"
          type="ghost"
          onClick={onDeleteSelectedCanvasAnnotation}
        />
      </ToolBar>
    </div>
  );
};

// The bottom attribute doesn't take the `marginBottom` into account, hence this will be 4px over the primary tooltip
const AbsoluteDiv = styled.div`
  position: absolute;
  bottom: 14px;
  left: 100%;
  transform: translate(-100%, -100%);
`;
