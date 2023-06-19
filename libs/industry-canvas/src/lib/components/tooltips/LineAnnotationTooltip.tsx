import { useState } from 'react';

import { startCase } from 'lodash';

import { Button, Dropdown, Menu, ToolBar, Tooltip } from '@cognite/cogs.js';
import { PolylineAnnotation } from '@cognite/unified-file-viewer';

import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';
import { translationKeys } from '../../common';
import { LINE_STROKE_WIDTH } from '../../constants';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import { useTranslation } from '../../hooks/useTranslation';
import { FillColorPalette } from '../color-palettes/FillColorPalette';

import { RightAlignedColorPalettePosition } from './elements';
import { LineEndTypeTooltip } from './LineEndTypeTooltip';

enum EditMode {
  IDLE,
  EDITING_STROKE_WIDTH,
  EDITING_FILL,
  EDITING_LINE_END_TYPE,
}

export type PolylineAnnotationTooltipProps = {
  lineAnnotation: PolylineAnnotation;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
  onDeleteSelectedCanvasAnnotation: () => void;
};

export const LineAnnotationTooltip: React.FC<
  PolylineAnnotationTooltipProps
> = ({
  lineAnnotation,
  onUpdateAnnotationStyleByType,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [editMode, setEditMode] = useState(EditMode.IDLE);
  const { t } = useTranslation();

  const toggleEditMode = (mode: EditMode) => {
    if (editMode === mode) {
      setEditMode(EditMode.IDLE);
    } else {
      setEditMode(mode);
    }
  };

  return (
    <>
      {editMode === EditMode.EDITING_FILL && (
        <RightAlignedColorPalettePosition>
          <FillColorPalette
            colors={Object.values(TEXT_ANNOTATION_COLOR_MAP)}
            selectedColor={lineAnnotation.style?.stroke}
            onUpdateColor={(color) => {
              onUpdateAnnotationStyleByType({
                line: { stroke: color },
              });
            }}
          />
        </RightAlignedColorPalettePosition>
      )}
      {editMode === EditMode.EDITING_LINE_END_TYPE && (
        <RightAlignedColorPalettePosition>
          <LineEndTypeTooltip
            selectedStartEndType={lineAnnotation.startEndType}
            selectedEndEndType={lineAnnotation.endEndType}
            onUpdateEndType={({ startEndType, endEndType }) => {
              onUpdateAnnotationStyleByType({
                line: { startEndType, endEndType },
              });
            }}
          />
        </RightAlignedColorPalettePosition>
      )}
      <ToolBar direction="horizontal">
        <>
          <Tooltip
            content={t(
              translationKeys.ANNOTATION_CHANGE_LINE_ENDS,
              'Change line end types'
            )}
          >
            <Button
              icon="ArrowUpRight"
              aria-label={t(
                translationKeys.ANNOTATION_CHANGE_LINE_ENDS,
                'Change line end types'
              )}
              type="ghost"
              toggled={editMode === EditMode.EDITING_LINE_END_TYPE}
              onClick={() => toggleEditMode(EditMode.EDITING_LINE_END_TYPE)}
            />
          </Tooltip>
          <Dropdown
            placement="top-start"
            onShown={() => setEditMode(EditMode.EDITING_STROKE_WIDTH)}
            content={
              <Menu>
                {Object.entries(LINE_STROKE_WIDTH).map(
                  ([strokeWidthName, strokeWidth]) => (
                    <Menu.Item
                      key={strokeWidth}
                      toggled={
                        strokeWidth === lineAnnotation.style?.strokeWidth
                      }
                      onClick={() => {
                        onUpdateAnnotationStyleByType({
                          line: { strokeWidth: strokeWidth },
                        });
                      }}
                    >
                      {startCase(strokeWidthName.toLowerCase())}
                    </Menu.Item>
                  )
                )}
              </Menu>
            }
          >
            {/* TODO: This isn't the correct icon. Update to the correct icon when id is added in Cogs.js */}
            <Tooltip
              content={t(
                translationKeys.ANNOTATION_CHANGE_LINE_STROKE_WIDTH,
                'Change stroke width'
              )}
            >
              <Button
                type="ghost"
                icon="AlignCenter"
                aria-label={t(
                  translationKeys.ANNOTATION_CHANGE_LINE_STROKE_WIDTH,
                  'Change stroke width'
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
              toggled={editMode === EditMode.EDITING_FILL}
              onClick={() => toggleEditMode(EditMode.EDITING_FILL)}
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
