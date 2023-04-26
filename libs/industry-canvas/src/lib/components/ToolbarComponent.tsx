import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ToolType } from '@cognite/unified-file-viewer';
import { useEffect, useState } from 'react';
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
              <Tooltip content="Rectangle tool">
                <Button
                  icon="Square"
                  type="ghost"
                  toggled={activeTool === ToolType.RECTANGLE}
                  aria-label="Rectangle tool"
                  onClick={() => onShapeToolChange(ToolType.RECTANGLE)}
                />
              </Tooltip>

              <Tooltip content="Ellipse tool">
                <Button
                  icon="Circle"
                  type="ghost"
                  toggled={activeTool === ToolType.ELLIPSE}
                  aria-label="Ellipse tool"
                  onClick={() => onShapeToolChange(ToolType.ELLIPSE)}
                />
              </Tooltip>
            </>
          </ToolBar>
        </ShapeToolbar>
      )}
      <ToolBar direction="vertical">
        <>
          <Tooltip content="Select tool" position="right">
            <Button
              icon="Cursor"
              type="ghost"
              toggled={activeTool === ToolType.SELECT}
              aria-label="Select tool"
              onClick={() => onToolChange(ToolType.SELECT)}
            />
          </Tooltip>

          <Tooltip content="Pan tool" position="right">
            <Button
              icon="Grab"
              type="ghost"
              toggled={activeTool === ToolType.PAN}
              aria-label="Pan tool"
              onClick={() => onToolChange(ToolType.PAN)}
            />
          </Tooltip>

          <Tooltip content="Text tool" position="right">
            <Button
              icon="Text"
              type="ghost"
              toggled={activeTool === ToolType.TEXT}
              aria-label="Text tool"
              onClick={() => onToolChange(ToolType.TEXT)}
            />
          </Tooltip>

          <Tooltip content="Add sticky" position="right">
            <StickyButton
              toggled={activeTool === ToolType.STICKY}
              aria-label="Sticky tool"
              onClick={() => onToolChange(ToolType.STICKY)}
            />
          </Tooltip>

          <Tooltip content="Shape tool" position="right">
            <Button
              icon="Shapes"
              type="ghost"
              toggled={isShapeToolActive}
              aria-label="Shape tool"
              onClick={onShapeToolClick}
            />
          </Tooltip>

          <Tooltip content="Line tool" position="right">
            <Button
              icon="VectorLine"
              type="ghost"
              toggled={activeTool === ToolType.LINE}
              aria-label="Line tool"
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
