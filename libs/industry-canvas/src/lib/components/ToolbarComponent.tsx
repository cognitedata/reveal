import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ToolType } from '@cognite/unified-file-viewer';
import { useState } from 'react';
import styled from 'styled-components';
import { StickyButton } from './StickyButton';

export type ToolbarComponentProps = {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
};

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  activeTool,
  onToolChange,
}) => {
  const [isShapeToolActive, setIsShapeToolActive] = useState(false);

  const [activeShapeTool, setActiveShapeTool] = useState<ToolType>(
    ToolType.RECTANGLE
  );

  const onShapeToolClick = () => {
    setIsShapeToolActive(true);
    onToolChange(activeShapeTool);
  };

  const onSetShapeTool = (tool: ToolType) => {
    setActiveShapeTool(tool);
    onToolChange(tool);
  };

  const onToolChangeWrapper = (tool: ToolType) => {
    setIsShapeToolActive(false);
    onToolChange(tool);
  };

  return (
    <>
      {isShapeToolActive && (
        <ShapeToolbar>
          <ToolBar direction="horizontal">
            <>
              <Tooltip content="Rectangle tool">
                <Button
                  icon="Square"
                  type="ghost"
                  toggled={activeTool === ToolType.RECTANGLE}
                  aria-label="Rectangle tool"
                  onClick={() => onSetShapeTool(ToolType.RECTANGLE)}
                />
              </Tooltip>

              <Tooltip content="Ellipse tool">
                <Button
                  icon="Circle"
                  type="ghost"
                  toggled={activeTool === ToolType.ELLIPSE}
                  aria-label="Ellipse tool"
                  onClick={() => onSetShapeTool(ToolType.ELLIPSE)}
                />
              </Tooltip>
            </>
          </ToolBar>
        </ShapeToolbar>
      )}
      <ToolBar direction="vertical">
        <>
          <Tooltip content="Select tool">
            <Button
              icon="Cursor"
              type="ghost"
              toggled={activeTool === ToolType.SELECT}
              aria-label="Select tool"
              onClick={() => onToolChangeWrapper(ToolType.SELECT)}
            />
          </Tooltip>

          <Tooltip content="Pan tool">
            <Button
              icon="Grab"
              type="ghost"
              toggled={activeTool === ToolType.PAN}
              aria-label="Pan tool"
              onClick={() => onToolChangeWrapper(ToolType.PAN)}
            />
          </Tooltip>

          <Tooltip content="Text tool">
            <Button
              icon="Text"
              type="ghost"
              toggled={activeTool === ToolType.TEXT}
              aria-label="Text tool"
              onClick={() => onToolChangeWrapper(ToolType.TEXT)}
            />
          </Tooltip>

          <Tooltip content="Add sticky">
            <StickyButton
              toggled={activeTool === ToolType.STICKY}
              aria-label="Sticky tool"
              onClick={() => onToolChangeWrapper(ToolType.STICKY)}
            />
          </Tooltip>

          <Tooltip content="Shape tool">
            <Button
              icon="Shapes"
              type="ghost"
              toggled={isShapeToolActive}
              aria-label="Shape tool"
              onClick={onShapeToolClick}
            />
          </Tooltip>

          <Tooltip content="Line tool">
            <Button
              icon="VectorLine"
              type="ghost"
              toggled={activeTool === ToolType.LINE}
              aria-label="Line tool"
              onClick={() => onToolChangeWrapper(ToolType.LINE)}
            />
          </Tooltip>
        </>
      </ToolBar>
    </>
  );
};

const ShapeToolbar = styled.div`
  position: absolute;
  top: 108px;
  left: 48px;
`;

export default ToolbarComponent;
