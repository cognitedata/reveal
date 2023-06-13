import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { invert } from 'lodash';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { CommentsFeatureFlagKey } from '../../constants';
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

  const { isEnabled: isCommentsEnabled } = useFlag(CommentsFeatureFlagKey, {
    fallback: false,
  });

  if (isCanvasLocked) {
    return (
      <ToolBar direction="vertical">
        <Tooltip content="Grab" position="right">
          <Button
            icon="Grab"
            type="ghost"
            toggled={activeTool === IndustryCanvasToolType.PAN}
            aria-label="Grab"
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
                    label="Rectangle"
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
                  aria-label="Rectangle"
                  onClick={() =>
                    onShapeToolChange(IndustryCanvasToolType.RECTANGLE)
                  }
                />
              </Tooltip>

              <Tooltip
                content={
                  <ToolTooltip
                    label="Ellipse"
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
                  aria-label="Ellipse"
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
                label="Select"
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
              aria-label="Select"
              onClick={() => onToolChange(IndustryCanvasToolType.SELECT)}
            />
          </Tooltip>

          <Tooltip content="Grab" position="right">
            <Button
              icon="Grab"
              type="ghost"
              toggled={activeTool === IndustryCanvasToolType.PAN}
              aria-label="Grab"
              onClick={() => onToolChange(IndustryCanvasToolType.PAN)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                label="Text"
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
              aria-label="Text"
              onClick={() => onToolChange(IndustryCanvasToolType.TEXT)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                label="Sticky note"
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
              aria-label="Sticky note"
              onClick={() => onToolChange(IndustryCanvasToolType.STICKY)}
            />
          </Tooltip>

          <Tooltip content="Shape" position="right">
            <Button
              icon="Shapes"
              type="ghost"
              toggled={isShapeToolActive}
              aria-label="Shape"
              onClick={onShapeToolClick}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                label="Line"
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
              aria-label="Line"
              onClick={() => onToolChange(IndustryCanvasToolType.LINE)}
            />
          </Tooltip>
          {isCommentsEnabled && (
            <Tooltip
              content={
                <ToolTooltip
                  label="Comment"
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
                icon="Comment"
                type="ghost"
                toggled={activeTool === IndustryCanvasToolType.COMMENT}
                aria-label="Comment"
                onClick={() => onToolChange(IndustryCanvasToolType.COMMENT)}
              />
            </Tooltip>
          )}
        </>
      </ToolBar>
    </>
  );
};

const ShapeToolbar = styled.div`
  position: absolute;
  top: 144px;
  left: 48px;
`;

export default ToolbarComponent;
