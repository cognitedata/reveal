import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { ToolType } from '@cognite/unified-file-viewer';

export type ToolbarComponentProps = {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
};

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  activeTool,
  onToolChange,
}) => {
  const ButtonGroup: ToolBarButton[] = [
    {
      icon: 'Grab',
      description: 'Pan',
      'aria-label': 'Pan tool',
      onClick: () => {
        onToolChange(ToolType.PAN);
      },
      disabled: activeTool === ToolType.PAN,
    },
    {
      icon: 'Cursor',
      description: 'Select',
      'aria-label': 'Select tool',
      onClick: () => {
        onToolChange(ToolType.SELECT);
      },
      disabled: activeTool === ToolType.SELECT,
    },
    {
      icon: 'Square',
      description: 'Rectangle',
      'aria-label': 'Rectangle tool',
      onClick: () => {
        onToolChange(ToolType.RECTANGLE);
      },
      disabled: activeTool === ToolType.RECTANGLE,
    },
  ];

  return (
    <ToolBar direction="vertical">
      <ToolBar.ButtonGroup buttonGroup={ButtonGroup} />
    </ToolBar>
  );
};

export default ToolbarComponent;
