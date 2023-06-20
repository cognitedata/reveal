import { useEffect, useState } from 'react';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { TextAnnotation } from '@cognite/unified-file-viewer';
import getFontSizeValue from '@cognite/unified-file-viewer/dist/core/utils/getFontSizeValue';

import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';
import { translationKeys } from '../../common';
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZES,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '../../constants';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import { useTranslation } from '../../hooks/useTranslation';
import { FillColorPalette } from '../color-palettes/FillColorPalette';

import { LeftAlignedColorPalettePosition } from './elements';
import { SizeEditor } from './SizeEditor';

enum EditMode {
  IDLE,
  EDITING_COLOR,
  EDITING_FONT_SIZE,
}

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
  const [editMode, setEditMode] = useState(EditMode.IDLE);
  const [fontSizeValue, setFontSizeValue] = useState<number | undefined>(
    getFontSizeValue(textAnnotation.style?.fontSize ?? DEFAULT_FONT_SIZE)
  );
  const { t } = useTranslation();

  const toggleEditMode = (mode: EditMode) => {
    if (editMode === mode) {
      setEditMode(EditMode.IDLE);
    } else {
      setEditMode(mode);
    }
  };

  useEffect(() => {
    if (fontSizeValue === undefined) {
      return;
    }
    if (fontSizeValue < MIN_FONT_SIZE || fontSizeValue > MAX_FONT_SIZE) {
      return;
    }
    onUpdateAnnotationStyleByType({
      text: { fontSize: `${fontSizeValue}px` },
    });
    // We ignore `onUpdateAnnotationStyleByType` as dependency since if we add
    // that to the list, this hook is, for some reason, called infinitely many times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSizeValue]);

  return (
    <>
      {editMode === EditMode.EDITING_COLOR && (
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
      {editMode === EditMode.EDITING_FONT_SIZE && (
        <LeftAlignedColorPalettePosition>
          <SizeEditor
            value={fontSizeValue}
            minValue={MIN_FONT_SIZE}
            maxValue={MAX_FONT_SIZE}
            dropdownValues={FONT_SIZES.map(getFontSizeValue)}
            setValue={(value) => setFontSizeValue(value)}
          />
        </LeftAlignedColorPalettePosition>
      )}
      <ToolBar aria-label="Text annotation toolbar" direction="horizontal">
        <>
          <Tooltip
            content={t(
              translationKeys.ANNOTATION_CHANGE_FONT_SIZE,
              'Change font size'
            )}
          >
            <Button
              type="ghost"
              icon="Typography"
              aria-label="Font size menu"
              toggled={editMode === EditMode.EDITING_FONT_SIZE}
              onClick={() => toggleEditMode(EditMode.EDITING_FONT_SIZE)}
            />
          </Tooltip>
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
              toggled={editMode === EditMode.EDITING_COLOR}
              onClick={() => toggleEditMode(EditMode.EDITING_COLOR)}
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
