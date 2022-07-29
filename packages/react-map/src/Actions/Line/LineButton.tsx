import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';

import { drawModes, DrawMode } from '../../FreeDraw';
import { TOOLTIP_TEXT } from '../../constants';
import { ButtonContainer } from '../elements';

export const LineButton: React.FC<{
  disabled?: boolean;
  drawMode: DrawMode;
  setDrawMode: (mode: string) => void;
}> = React.memo(({ setDrawMode, drawMode, disabled }) => {
  const selected = drawMode === drawModes.DRAW_LINE_STRING;

  const handleLineTool = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDrawMode(
      selected
        ? // this is the polygon mode from mapbox
          drawModes.SIMPLE_SELECT
        : // line mode
          drawModes.DRAW_LINE_STRING
    );
  };

  return (
    <ButtonContainer selected={selected}>
      <Tooltip content={TOOLTIP_TEXT}>
        <Button
          type="ghost"
          icon="VectorLine"
          disabled={disabled}
          onClick={handleLineTool}
          aria-label={TOOLTIP_TEXT}
          data-testid="line-button"
        />
      </Tooltip>
    </ButtonContainer>
  );
});
