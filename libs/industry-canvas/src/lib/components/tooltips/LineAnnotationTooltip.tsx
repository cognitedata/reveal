import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { debounce } from 'lodash';

import { Button, Slider, ToolBar, Tooltip } from '@cognite/cogs.js';
import { PolylineAnnotation } from '@cognite/unified-file-viewer';

import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';
import { translationKeys } from '../../common';
import { MIN_STROKE_WIDTH, MAX_STROKE_WIDTH } from '../../constants';
import { UseOnUpdateSelectedAnnotationReturnType } from '../../hooks/useOnUpdateSelectedAnnotation';
import { useTranslation } from '../../hooks/useTranslation';
import { FillColorPalette } from '../color-palettes/FillColorPalette';

import {
  LeftAlignedColorPalettePosition,
  RightAlignedColorPalettePosition,
} from './elements';
import { LineDashTooltip } from './LineDashTooltip';
import { LineEndTypeTooltip } from './LineEndTypeTooltip';
import { LineThicknessButton } from './LineThicknessButton';
import { SizeEditor } from './SizeEditor';

const UPDATE_STROKE_WIDTH_DEBOUNCE_MS = 200;

enum EditMode {
  IDLE,
  EDITING_STROKE_WIDTH,
  EDITING_FILL,
  EDITING_LINE_END_TYPE,
}

export type PolylineAnnotationTooltipProps = {
  lineAnnotation: PolylineAnnotation;
  onDeleteSelectedCanvasAnnotation: () => void;
} & UseOnUpdateSelectedAnnotationReturnType;

export const LineAnnotationTooltip: React.FC<
  PolylineAnnotationTooltipProps
> = ({
  lineAnnotation,
  onUpdateSelectedAnnotation,
  onDeleteSelectedCanvasAnnotation,
}) => {
  const [strokeWidth, setStrokeWidth] = useState<number | undefined>(
    lineAnnotation.style?.strokeWidth ?? MIN_STROKE_WIDTH
  );
  const [editMode, setEditMode] = useState(EditMode.IDLE);
  const { t } = useTranslation();

  const debouncedUpdateLineAnnotationStrokeWidth = debounce(
    (value: number) =>
      onUpdateSelectedAnnotation({ line: { strokeWidth: value } }),
    UPDATE_STROKE_WIDTH_DEBOUNCE_MS
  );

  const toggleEditMode = (mode: EditMode) => {
    if (editMode === mode) {
      setEditMode(EditMode.IDLE);
    } else {
      setEditMode(mode);
    }
  };

  useEffect(() => {
    if (lineAnnotation.style?.strokeWidth === strokeWidth) {
      return;
    }

    if (strokeWidth === undefined) {
      return;
    }

    debouncedUpdateLineAnnotationStrokeWidth(strokeWidth);
    // We ignore `onUpdateAnnotationStyleByType` as dependency since if we add
    // that to the list, this hook is, for some reason, called infinitely many times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokeWidth]);

  return (
    <>
      {editMode === EditMode.EDITING_FILL && (
        <RightAlignedColorPalettePosition>
          <FillColorPalette
            colors={Object.values(TEXT_ANNOTATION_COLOR_MAP)}
            selectedColor={lineAnnotation.style?.stroke}
            onUpdateColor={(color) => {
              onUpdateSelectedAnnotation({
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
              onUpdateSelectedAnnotation({
                line: { startEndType, endEndType },
              });
            }}
          />
        </RightAlignedColorPalettePosition>
      )}
      {editMode === EditMode.EDITING_STROKE_WIDTH && (
        <StrokeTooltipContainer>
          <ToolBar direction="vertical">
            <StyledSlider
              value={strokeWidth}
              onChange={setStrokeWidth}
              min={MIN_STROKE_WIDTH}
              max={MAX_STROKE_WIDTH}
            />
            <ToolBar style={{ boxShadow: 'none' }} direction="horizontal">
              <SizeEditor
                value={strokeWidth}
                minValue={MIN_STROKE_WIDTH}
                maxValue={MAX_STROKE_WIDTH}
                setValue={setStrokeWidth}
              />
              <LineDashTooltip
                dash={lineAnnotation.style?.dash}
                onUpdateDash={(dash) =>
                  onUpdateSelectedAnnotation({ line: { dash } })
                }
              />
            </ToolBar>
          </ToolBar>
        </StrokeTooltipContainer>
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
          <LineThicknessButton
            isToggled={editMode === EditMode.EDITING_STROKE_WIDTH}
            onClick={() => toggleEditMode(EditMode.EDITING_STROKE_WIDTH)}
          />
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

const STROKE_TOOLTIP_Y_OFFSET_PERCENTAGE = '-52%';
const StrokeTooltipContainer = styled(LeftAlignedColorPalettePosition)`
  transform: translate(0%, ${STROKE_TOOLTIP_Y_OFFSET_PERCENTAGE});
`;

const StyledSlider = styled(Slider)`
  && {
    width: 90%;
    padding-top: 18px;
    transform: translate(0, -30%);
  }
`;
