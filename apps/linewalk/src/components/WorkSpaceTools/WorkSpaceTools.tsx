import { Button, Icon } from '@cognite/cogs.js';
import { WorkspaceTool } from 'components/LineReviewViewer/useWorkspaceTools';

import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import { WorkSpaceToolsWrapper } from './elements';

type WorkSpaceToolsProps = {
  tool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  enabledTools?: WorkspaceTool[];
  areKeyboardShortcutsEnabled: boolean;
};

const WorkSpaceTools = ({
  tool,
  onToolChange,
  enabledTools = [
    WorkspaceTool.DEFAULT,
    WorkspaceTool.MOVE,
    WorkspaceTool.RECTANGLE,
    WorkspaceTool.TEXT,
  ],
  areKeyboardShortcutsEnabled,
}: WorkSpaceToolsProps) => (
  <WorkSpaceToolsWrapper>
    {enabledTools.includes(WorkspaceTool.DEFAULT) && (
      <Button
        type="ghost"
        size="small"
        title="Move M"
        onClick={() => onToolChange(WorkspaceTool.DEFAULT)}
        disabled={tool === WorkspaceTool.DEFAULT}
      >
        <Icon type="Cursor" />
      </Button>
    )}
    {enabledTools.includes(WorkspaceTool.RECTANGLE) && (
      <Button
        type="ghost"
        size="small"
        title="Rectangle R"
        onClick={() => onToolChange(WorkspaceTool.RECTANGLE)}
        disabled={tool === WorkspaceTool.RECTANGLE}
      >
        <Icon type="FrameTool" />
      </Button>
    )}
    {enabledTools.includes(WorkspaceTool.TEXT) && (
      <Button
        type="ghost"
        size="small"
        title="Text T"
        onClick={() => onToolChange(WorkspaceTool.TEXT)}
        disabled={tool === WorkspaceTool.TEXT}
      >
        <Icon type="Text" />
      </Button>
    )}
    {enabledTools.includes(WorkspaceTool.MOVE) && (
      <Button
        type="ghost"
        size="small"
        title="Move M"
        onClick={() => onToolChange(WorkspaceTool.MOVE)}
        disabled={tool === 'move'}
      >
        <Icon type="Grab" />
      </Button>
    )}
    {areKeyboardShortcutsEnabled && (
      <KeyboardShortcut
        keys="m"
        onKeyDown={() => onToolChange(WorkspaceTool.MOVE)}
      />
    )}
  </WorkSpaceToolsWrapper>
);

export default WorkSpaceTools;
