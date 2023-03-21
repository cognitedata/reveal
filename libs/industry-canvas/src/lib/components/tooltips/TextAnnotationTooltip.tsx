import { Button, Dropdown, Menu, ToolBar } from '@cognite/cogs.js';
import { TextAnnotation } from '@cognite/unified-file-viewer';
import { useState } from 'react';
import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';
import { FONT_SIZE } from '../../constants';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
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
            <Button
              type="ghost"
              icon="Typography"
              aria-label="Font size menu"
            ></Button>
          </Dropdown>
          <Button
            icon="ColorPalette"
            aria-label="Edit color"
            type={isInEditMode ? 'secondary' : 'ghost'}
            onClick={() => {
              setIsInEditMode((prev) => !prev);
            }}
          />
        </>
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
