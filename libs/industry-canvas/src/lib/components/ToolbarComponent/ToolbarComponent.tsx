import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { invert } from 'lodash';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import { useTranslation } from '../../hooks/useTranslation';
import { IndustryCanvasToolType } from '../../types';
import { StickyButton } from '../StickyButton';

import ToolTooltip from './ToolTooltip';

export type ToolbarComponentProps = {
  activeTool: IndustryCanvasToolType;
  onToolChange: (tool: IndustryCanvasToolType) => void;
  isCanvasLocked: boolean;
};

export const IndustryCanvasToolTypeByShortcutKey: Record<
  string,
  IndustryCanvasToolType
> = {
  v: IndustryCanvasToolType.SELECT,
  l: IndustryCanvasToolType.LINE,
  t: IndustryCanvasToolType.TEXT,
  r: IndustryCanvasToolType.RECTANGLE,
  o: IndustryCanvasToolType.ELLIPSE,
  n: IndustryCanvasToolType.STICKY,
  c: IndustryCanvasToolType.COMMENT,
};
export const ShortcutKeysByIndustryCanvasToolType = invert(
  IndustryCanvasToolTypeByShortcutKey
);

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  activeTool,
  onToolChange,
  isCanvasLocked,
}) => {
  const [isShapeToolActive, setIsShapeToolActive] = useState(false);
  const { t } = useTranslation();

  const [activeShapeTool, setActiveShapeTool] =
    useState<IndustryCanvasToolType>(IndustryCanvasToolType.RECTANGLE);

  const onShapeToolChange = (shapeTool: IndustryCanvasToolType) => {
    setActiveShapeTool(shapeTool);
    onToolChange(shapeTool);
  };

  const onShapeToolClick = () => {
    onToolChange(activeShapeTool);
  };

  useEffect(() => {
    setIsShapeToolActive(
      activeTool === IndustryCanvasToolType.RECTANGLE ||
        activeTool === IndustryCanvasToolType.ELLIPSE
    );
  }, [activeTool]);

  if (isCanvasLocked) {
    return (
      <ToolBar direction="vertical">
        <Tooltip
          content={t(translationKeys.TOOLBAR_GRAB_BUTTON, 'Grab')}
          position="right"
        >
          <Button
            icon="Grab"
            type="ghost"
            toggled={activeTool === IndustryCanvasToolType.PAN}
            aria-label={t(translationKeys.TOOLBAR_GRAB_BUTTON, 'Grab')}
            onClick={() => onToolChange(IndustryCanvasToolType.PAN)}
          />
        </Tooltip>
      </ToolBar>
    );
  }

  return (
    <>
      {isShapeToolActive && (
        <ShapeToolbar>
          <ToolBar direction="horizontal">
            <>
              <Tooltip
                content={
                  <ToolTooltip
                    label={t(
                      translationKeys.TOOLBAR_RECTANGLE_BUTTON,
                      'Rectangle'
                    )}
                    keys={[
                      ShortcutKeysByIndustryCanvasToolType[
                        IndustryCanvasToolType.RECTANGLE
                      ],
                    ]}
                  />
                }
              >
                <Button
                  icon="Square"
                  type="ghost"
                  toggled={activeTool === IndustryCanvasToolType.RECTANGLE}
                  aria-label={t(
                    translationKeys.TOOLBAR_RECTANGLE_BUTTON,
                    'Rectangle'
                  )}
                  onClick={() =>
                    onShapeToolChange(IndustryCanvasToolType.RECTANGLE)
                  }
                />
              </Tooltip>

              <Tooltip
                content={
                  <ToolTooltip
                    label={t(translationKeys.TOOLBAR_ELLIPSE_BUTTON, 'Ellipse')}
                    keys={[
                      ShortcutKeysByIndustryCanvasToolType[
                        IndustryCanvasToolType.ELLIPSE
                      ],
                    ]}
                  />
                }
              >
                <Button
                  icon="Circle"
                  type="ghost"
                  toggled={activeTool === IndustryCanvasToolType.ELLIPSE}
                  aria-label={t(
                    translationKeys.TOOLBAR_ELLIPSE_BUTTON,
                    'Ellipse'
                  )}
                  onClick={() =>
                    onShapeToolChange(IndustryCanvasToolType.ELLIPSE)
                  }
                />
              </Tooltip>
            </>
          </ToolBar>
        </ShapeToolbar>
      )}
      <ToolBar direction="vertical">
        <>
          <Tooltip
            content={
              <ToolTooltip
                key="select"
                label={t(translationKeys.TOOLBAR_SELECT_BUTTON, 'Select')}
                keys={[
                  ShortcutKeysByIndustryCanvasToolType[
                    IndustryCanvasToolType.SELECT
                  ],
                ]}
              />
            }
            position="right"
          >
            <Button
              icon="Cursor"
              type="ghost"
              toggled={activeTool === IndustryCanvasToolType.SELECT}
              aria-label={t(translationKeys.TOOLBAR_SELECT_BUTTON, 'Select')}
              onClick={() => onToolChange(IndustryCanvasToolType.SELECT)}
            />
          </Tooltip>

          <Tooltip
            content={t(translationKeys.TOOLBAR_GRAB_BUTTON, 'Grab')}
            position="right"
          >
            <Button
              icon="Grab"
              type="ghost"
              toggled={activeTool === IndustryCanvasToolType.PAN}
              aria-label={t(translationKeys.TOOLBAR_GRAB_BUTTON, 'Grab')}
              onClick={() => onToolChange(IndustryCanvasToolType.PAN)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                key="text"
                label={t(translationKeys.TOOLBAR_TEXT_BUTTON, 'Text')}
                keys={[
                  ShortcutKeysByIndustryCanvasToolType[
                    IndustryCanvasToolType.TEXT
                  ],
                ]}
              />
            }
            position="right"
          >
            <Button
              icon="Text"
              type="ghost"
              toggled={activeTool === IndustryCanvasToolType.TEXT}
              aria-label={t(translationKeys.TOOLBAR_TEXT_BUTTON, 'Text')}
              onClick={() => onToolChange(IndustryCanvasToolType.TEXT)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                key="sticky"
                label={t(
                  translationKeys.TOOLBAR_STICKY_NOTE_BUTTON,
                  'Sticky note'
                )}
                keys={[
                  ShortcutKeysByIndustryCanvasToolType[
                    IndustryCanvasToolType.STICKY
                  ],
                ]}
              />
            }
            position="right"
          >
            <StickyButton
              toggled={activeTool === IndustryCanvasToolType.STICKY}
              aria-label={t(
                translationKeys.TOOLBAR_STICKY_NOTE_BUTTON,
                'Sticky note'
              )}
              onClick={() => onToolChange(IndustryCanvasToolType.STICKY)}
            />
          </Tooltip>

          <Tooltip
            content={t(translationKeys.TOOLBAR_SHAPE_BUTTON, 'Shape')}
            position="right"
          >
            <Button
              icon="Shapes"
              type="ghost"
              toggled={isShapeToolActive}
              aria-label={t(translationKeys.TOOLBAR_SHAPE_BUTTON, 'Shape')}
              onClick={onShapeToolClick}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                key="line"
                label={t(translationKeys.TOOLBAR_LINE_BUTTON, 'Line')}
                keys={[
                  ShortcutKeysByIndustryCanvasToolType[
                    IndustryCanvasToolType.LINE
                  ],
                ]}
              />
            }
            position="right"
          >
            <Button
              icon="VectorLine"
              type="ghost"
              toggled={activeTool === IndustryCanvasToolType.LINE}
              aria-label={t(translationKeys.TOOLBAR_LINE_BUTTON, 'Line')}
              onClick={() => onToolChange(IndustryCanvasToolType.LINE)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                key="comment"
                label={t(translationKeys.TOOLBAR_COMMENT_BUTTON, 'Comment')}
                keys={[
                  ShortcutKeysByIndustryCanvasToolType[
                    IndustryCanvasToolType.COMMENT
                  ],
                ]}
              />
            }
            position="right"
          >
            <Button
              icon="Comment"
              type="ghost"
              toggled={activeTool === IndustryCanvasToolType.COMMENT}
              aria-label={t(translationKeys.TOOLBAR_COMMENT_BUTTON, 'Comment')}
              onClick={() => onToolChange(IndustryCanvasToolType.COMMENT)}
            />
          </Tooltip>
        </>
      </ToolBar>
    </>
  );
};

const ShapeToolbar = styled.div`
  position: absolute;
  top: 160px;
  left: 55px;
`;

export default ToolbarComponent;
