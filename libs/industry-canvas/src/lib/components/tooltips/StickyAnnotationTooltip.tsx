import React, { useState } from 'react';
import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { StickyAnnotation } from '@cognite/unified-file-viewer/dist/core/annotations/types';
import { STICKY_ANNOTATION_COLOR_MAP } from '../../colors';
import { Colors } from '@cognite/cogs.js';

import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import { CircleButton } from '../color-palettes/CircleButton';
import { RightAlignedColorPalettePosition } from './elements';

export type StickyAnnotationTooltipProps = {
  stickyAnnotation: StickyAnnotation;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
  onDeleteSelectedCanvasAnnotation: () => void;
};

export const StickyAnnotationTooltip: React.FC<
  StickyAnnotationTooltipProps
> = ({
  stickyAnnotation,
  onUpdateAnnotationStyleByType,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [isInEditFillMode, setIsInEditFillMode] = useState(false);

  return (
    <>
      {isInEditFillMode && (
        <RightAlignedColorPalettePosition>
          <ToolBar direction="horizontal">
            <>
              {Object.values(STICKY_ANNOTATION_COLOR_MAP).map((color) => (
                <CircleButton
                  stroke={Colors['border--interactive--default']}
                  fill={color}
                  isToggled={stickyAnnotation.style?.backgroundColor === color}
                  onClick={() => {
                    onUpdateAnnotationStyleByType({
                      sticky: { backgroundColor: color },
                    });
                  }}
                  key={color}
                />
              ))}
            </>
          </ToolBar>
        </RightAlignedColorPalettePosition>
      )}
      <ToolBar direction="horizontal">
        <>
          <Tooltip content="Change color">
            <CircleButton
              isToggled={isInEditFillMode}
              aria-label="Edit color"
              onClick={() => {
                setIsInEditFillMode((prev) => !prev);
              }}
              stroke={Colors['border--interactive--default']}
              fill={stickyAnnotation.style?.backgroundColor}
            />
          </Tooltip>
        </>
        <Tooltip content="Delete sticky">
          <Button
            icon="Delete"
            type="ghost"
            aria-label="Delete sticky"
            onClick={onDeleteSelectedCanvasAnnotation}
          />
        </Tooltip>
      </ToolBar>
    </>
  );
};
