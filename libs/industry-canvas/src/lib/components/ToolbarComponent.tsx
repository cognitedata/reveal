import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ToolType } from '@cognite/unified-file-viewer';

export type ToolbarComponentProps = {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
};

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  activeTool,
  onToolChange,
}) => {
  return (
    <ToolBar direction="vertical">
      <>
        <Tooltip content="Select tool">
          <Button
            icon="Cursor"
            type={activeTool === ToolType.SELECT ? 'secondary' : 'ghost'}
            aria-label="Select tool"
            onClick={() => onToolChange(ToolType.SELECT)}
          />
        </Tooltip>

        <Tooltip content="Pan tool">
          <Button
            icon="Grab"
            type={activeTool === ToolType.PAN ? 'secondary' : 'ghost'}
            aria-label="Pan tool"
            onClick={() => onToolChange(ToolType.PAN)}
          />
        </Tooltip>

        <Tooltip content="Text tool">
          <Button
            icon="Text"
            type={activeTool === ToolType.TEXT ? 'secondary' : 'ghost'}
            aria-label="Text tool"
            onClick={() => onToolChange(ToolType.TEXT)}
          />
        </Tooltip>

        <Tooltip content="Rectangle tool">
          <Button
            icon="Square"
            type={activeTool === ToolType.RECTANGLE ? 'secondary' : 'ghost'}
            aria-label="Rectangle tool"
            onClick={() => onToolChange(ToolType.RECTANGLE)}
          />
        </Tooltip>

        <Tooltip content="Line tool">
          <Button
            icon="VectorLine"
            type={activeTool === ToolType.LINE ? 'secondary' : 'ghost'}
            aria-label="Line tool"
            onClick={() => onToolChange(ToolType.LINE)}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
};

export default ToolbarComponent;
