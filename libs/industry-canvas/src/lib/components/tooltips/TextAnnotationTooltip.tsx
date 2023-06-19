import { useState } from 'react';

import { Button, Dropdown, Menu, ToolBar, Tooltip } from '@cognite/cogs.js';
import { TextAnnotation } from '@cognite/unified-file-viewer';

import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';
import { translationKeys } from '../../common';
import { FONT_SIZE } from '../../constants';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import { useTranslation } from '../../hooks/useTranslation';
import { FillColorPalette } from '../color-palettes/FillColorPalette';

import { LeftAlignedColorPalettePosition } from './elements';

export type TextAnnotationTooltipProps = {
  textAnnotation: TextAnnotation;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
  onDeleteSelectedCanvasAnnotation: () => void;
};

export const TextAnnotationTooltip: React.FC<TextAnnotationTooltipProps> = ({
  textAnnotation,
  onDeleteSelectedCanvasAnnotation,
  onUpdateAnnotationStyleByType,
}) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  const { t } = useTranslation();

  const selectedAnnotationFontSize = textAnnotation.style?.fontSize;
  return (
    <>
      {isInEditMode && (
        <LeftAlignedColorPalettePosition>
          <FillColorPalette
            colors={Object.values(TEXT_ANNOTATION_COLOR_MAP)}
            selectedColor={textAnnotation.style?.fill}
            onUpdateColor={(color) => {
              onUpdateAnnotationStyleByType({
                text: { fill: color },
              });
            }}
          />
        </LeftAlignedColorPalettePosition>
      )}
      <ToolBar direction="horizontal">
        <>
          <Dropdown
            placement="top-start"
            content={
              <Menu>
                {Object.values(FONT_SIZE).map((fontSize) => (
                  <Menu.Item
                    key={fontSize}
                    toggled={fontSize === selectedAnnotationFontSize}
                    onClick={() => {
                      onUpdateAnnotationStyleByType({
                        text: { fontSize },
                      });
                    }}
                  >
                    {fontSize}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Tooltip
              content={t(
                translationKeys.ANNOTATION_CHANGE_FONT_SIZE,
                'Change font size'
              )}
            >
              <Button
                type="ghost"
                icon="Typography"
                aria-label={t(
                  translationKeys.ANNOTATION_CHANGE_FONT_SIZE,
                  'Change font size'
                )}
              />
            </Tooltip>
          </Dropdown>
          <Tooltip
            content={t(
              translationKeys.ANNOTATION_CHANGE_COLOR_TOOLTIP,
              'Change color'
            )}
          >
            <Button
              icon="ColorPalette"
              aria-label={t(
                translationKeys.ANNOTATION_CHANGE_COLOR_TOOLTIP,
                'Change color'
              )}
              type="ghost"
              toggled={isInEditMode}
              onClick={() => {
                setIsInEditMode((prev) => !prev);
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
