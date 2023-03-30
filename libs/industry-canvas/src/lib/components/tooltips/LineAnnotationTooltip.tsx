import { useState } from 'react';
import { startCase } from 'lodash';
import { Button, Dropdown, Menu, ToolBar, Tooltip } from '@cognite/cogs.js';
import { PolylineAnnotation } from '@cognite/unified-file-viewer';

import { LINE_STROKE_WIDTH } from '../../constants';
import { OnUpdateAnnotationStyleByType } from '../../hooks/useManagedTools';
import { FillColorPalette } from '../color-palettes/FillColorPalette';
import { RightAlignedColorPalettePosition } from './elements';
import { TEXT_ANNOTATION_COLOR_MAP } from '../../colors';

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
  const [isInEditFillMode, setIsInEditFillMode] = useState(false);

  return (
    <>
      {isInEditFillMode && (
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
      <ToolBar direction="horizontal">
        <>
          <Dropdown
            placement="top-start"
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
            <Tooltip content="Change stroke width">
              <Button
                type="ghost"
                icon="AlignCenter"
                aria-label="Change stroke width"
              />
            </Tooltip>
          </Dropdown>
          <Tooltip content="Change color">
            <Button
              icon="ColorPalette"
              aria-label="Edit color"
              type="ghost"
              toggled={isInEditFillMode}
              onClick={() => {
                setIsInEditFillMode((prev) => !prev);
              }}
            />
          </Tooltip>
        </>
        <Tooltip content="Delete annotation">
          <Button
            icon="Delete"
            type="ghost"
            aria-label="Delete annotation"
            onClick={onDeleteSelectedCanvasAnnotation}
          />
        </Tooltip>
      </ToolBar>
    </>
  );
};
