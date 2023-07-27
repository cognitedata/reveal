import React, { useState } from 'react';

import { Button, ToolBar, Tooltip, Colors } from '@cognite/cogs.js';
import { StickyAnnotation } from '@cognite/unified-file-viewer/dist/core/annotations/types';

import { STICKY_ANNOTATION_COLOR_MAP } from '../../colors';
import { translationKeys } from '../../common';
import { UseOnUpdateSelectedAnnotationReturnType } from '../../hooks/useOnUpdateSelectedAnnotation';
import { useTranslation } from '../../hooks/useTranslation';
import { CircleButton } from '../color-palettes/CircleButton';

import { RightAlignedColorPalettePosition } from './elements';

export type StickyAnnotationTooltipProps = {
  stickyAnnotation: StickyAnnotation;
  onDeleteSelectedCanvasAnnotation: () => void;
} & UseOnUpdateSelectedAnnotationReturnType;

export const StickyAnnotationTooltip: React.FC<
  StickyAnnotationTooltipProps
> = ({
  stickyAnnotation,
  onUpdateSelectedAnnotation,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [isInEditFillMode, setIsInEditFillMode] = useState(false);
  const { t } = useTranslation();

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
                    onUpdateSelectedAnnotation({
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
          <Tooltip
            content={t(
              translationKeys.ANNOTATION_CHANGE_COLOR_TOOLTIP,
              'Change color'
            )}
          >
            <CircleButton
              isToggled={isInEditFillMode}
              aria-label={t(
                translationKeys.ANNOTATION_CHANGE_COLOR_TOOLTIP,
                'Change color'
              )}
              onClick={() => {
                setIsInEditFillMode((prev) => !prev);
              }}
              stroke={Colors['border--interactive--default']}
              fill={stickyAnnotation.style?.backgroundColor}
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
