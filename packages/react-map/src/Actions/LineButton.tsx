import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';

import { TOOLTIP_TEXT } from '../constants';

import { ButtonContainer } from './elements';

export const LineButton: React.FC<{
  disabled?: boolean;
  drawMode: string;
  setDrawMode: (mode: string) => void;
}> = React.memo(({ setDrawMode, drawMode, disabled }) => {
  const selected = drawMode === 'draw_line_string';

  const handleLineTool = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDrawMode(
      drawMode === 'draw_line_string'
        ? // this is the polygon mode from mapbox
          'simple_select'
        : // line mode
          'draw_line_string'
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
