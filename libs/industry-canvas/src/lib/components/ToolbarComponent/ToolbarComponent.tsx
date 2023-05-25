import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ToolType } from '@cognite/unified-file-viewer';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { invert } from 'lodash';
import { StickyButton } from '../StickyButton';
import ToolTooltip from './ToolTooltip';

export type ToolbarComponentProps = {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
};

export const ToolTypeByShortcutKey: Record<string, ToolType> = {
  v: ToolType.SELECT,
  l: ToolType.LINE,
  t: ToolType.TEXT,
  r: ToolType.RECTANGLE,
  o: ToolType.ELLIPSE,
  n: ToolType.STICKY,
};
export const ShortcutKeysByToolType = invert(ToolTypeByShortcutKey);

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  activeTool,
  onToolChange,
}) => {
  const [isShapeToolActive, setIsShapeToolActive] = useState(false);

  const [activeShapeTool, setActiveShapeTool] = useState<ToolType>(
    ToolType.RECTANGLE
  );

  const onShapeToolChange = (shapeTool: ToolType) => {
    setActiveShapeTool(shapeTool);
    onToolChange(shapeTool);
  };

  const onShapeToolClick = () => {
    onToolChange(activeShapeTool);
  };

  useEffect(() => {
    setIsShapeToolActive(
      activeTool === ToolType.RECTANGLE || activeTool === ToolType.ELLIPSE
    );
  }, [activeTool]);

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
                    keys={[ShortcutKeysByToolType[ToolType.RECTANGLE]]}
                  />
                }
              >
                <Button
                  icon="Square"
                  type="ghost"
                  toggled={activeTool === ToolType.RECTANGLE}
                  aria-label="Rectangle"
                  onClick={() => onShapeToolChange(ToolType.RECTANGLE)}
                />
              </Tooltip>

              <Tooltip
                content={
                  <ToolTooltip
                    label="Ellipse"
                    keys={[ShortcutKeysByToolType[ToolType.ELLIPSE]]}
                  />
                }
              >
                <Button
                  icon="Circle"
                  type="ghost"
                  toggled={activeTool === ToolType.ELLIPSE}
                  aria-label="Ellipse"
                  onClick={() => onShapeToolChange(ToolType.ELLIPSE)}
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
                keys={[ShortcutKeysByToolType[ToolType.SELECT]]}
              />
            }
            position="right"
          >
            <Button
              icon="Cursor"
              type="ghost"
              toggled={activeTool === ToolType.SELECT}
              aria-label="Select"
              onClick={() => onToolChange(ToolType.SELECT)}
            />
          </Tooltip>

          <Tooltip content="Grab" position="right">
            <Button
              icon="Grab"
              type="ghost"
              toggled={activeTool === ToolType.PAN}
              aria-label="Grab"
              onClick={() => onToolChange(ToolType.PAN)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                label="Text"
                keys={[ShortcutKeysByToolType[ToolType.TEXT]]}
              />
            }
            position="right"
          >
            <Button
              icon="Text"
              type="ghost"
              toggled={activeTool === ToolType.TEXT}
              aria-label="Text"
              onClick={() => onToolChange(ToolType.TEXT)}
            />
          </Tooltip>

          <Tooltip
            content={
              <ToolTooltip
                label="Sticky note"
                keys={[ShortcutKeysByToolType[ToolType.STICKY]]}
              />
            }
            position="right"
          >
            <StickyButton
              toggled={activeTool === ToolType.STICKY}
              aria-label="Sticky note"
              onClick={() => onToolChange(ToolType.STICKY)}
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
                keys={[ShortcutKeysByToolType[ToolType.LINE]]}
              />
            }
            position="right"
          >
            <Button
              icon="VectorLine"
              type="ghost"
              toggled={activeTool === ToolType.LINE}
              aria-label="Line"
              onClick={() => onToolChange(ToolType.LINE)}
            />
          </Tooltip>
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
