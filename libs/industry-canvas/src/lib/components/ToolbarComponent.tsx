import { Button, ToolBar } from '@cognite/cogs.js';
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
        <Button
          icon="Cursor"
          type={activeTool === ToolType.SELECT ? 'secondary' : 'ghost'}
          aria-label="Select tool"
          onClick={() => onToolChange(ToolType.SELECT)}
        />
        <Button
          icon="Grab"
          type={activeTool === ToolType.PAN ? 'secondary' : 'ghost'}
          aria-label="Pan tool"
          onClick={() => onToolChange(ToolType.PAN)}
        />
        <Button
          icon="Text"
          type={activeTool === ToolType.TEXT ? 'secondary' : 'ghost'}
          aria-label="Text tool"
          onClick={() => onToolChange(ToolType.TEXT)}
        />
        <Button
          icon="Square"
          type={activeTool === ToolType.RECTANGLE ? 'secondary' : 'ghost'}
          aria-label="Rectangle tool"
          onClick={() => onToolChange(ToolType.RECTANGLE)}
        />
        <Button
          icon="VectorLine"
          type={activeTool === ToolType.LINE ? 'secondary' : 'ghost'}
          aria-label="Line tool"
          onClick={() => onToolChange(ToolType.LINE)}
        />
      </>
    </ToolBar>
  );
};

export default ToolbarComponent;
