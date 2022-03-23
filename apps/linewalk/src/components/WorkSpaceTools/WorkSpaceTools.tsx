import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { AnnotationIcon } from 'components/CustomIcons';
import { WorkspaceTool } from 'components/LineReviewViewer/useWorkspaceTools';

import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

type WorkSpaceToolsProps = {
  tool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  isMaskingEnabled?: boolean;
  onToggleMasking?: () => void;
  enabledTools?: WorkspaceTool[];
  areKeyboardShortcutsEnabled: boolean;
};

const DEFAULT_LAYER_STYLE = {
  marginRight: 16,
  filter: '',
  opacity: 1,
};
const HIDDEN_LAYER_STYLE = {
  filter: 'grayscale(1)',
  opacity: 0.2,
};

const WorkSpaceTools = ({
  tool,
  onToolChange,
  isMaskingEnabled,
  onToggleMasking,
  enabledTools = [
    WorkspaceTool.LAYERS,
    WorkspaceTool.SELECT,
    WorkspaceTool.MOVE,
    WorkspaceTool.LINE,
    WorkspaceTool.RECTANGLE,
    WorkspaceTool.CIRCLE,
    WorkspaceTool.TEXT,
    WorkspaceTool.COMMENT,
  ],
  areKeyboardShortcutsEnabled,
}: WorkSpaceToolsProps) => (
  <WorkSpaceToolsWrapper>
    {enabledTools.includes(WorkspaceTool.LAYERS) && onToggleMasking && (
      <>
        <Dropdown
          content={
            <Menu>
              <Menu.Header>Click to turn on / off</Menu.Header>
              <Menu.Item
                onClick={onToggleMasking}
                style={{
                  ...DEFAULT_LAYER_STYLE,
                  ...(isMaskingEnabled ? {} : HIDDEN_LAYER_STYLE),
                }}
              >
                <AnnotationIcon style={{ marginRight: 8 }} />
                Masking
              </Menu.Item>
            </Menu>
          }
          placement="auto-end"
        >
          <Button
            type="ghost"
            size="small"
            onClick={() => onToolChange(WorkspaceTool.MOVE)}
            title="Layers"
          >
            <Icon type="Layers" />
          </Button>
        </Dropdown>

        <ToolboxSeparator />
      </>
    )}
    {enabledTools.includes(WorkspaceTool.SELECT) && (
      <Button
        type="ghost"
        size="small"
        title="Move M"
        onClick={() => onToolChange(WorkspaceTool.SELECT)}
        disabled={tool === WorkspaceTool.SELECT}
      >
        <Icon type="Cursor" />
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
    {enabledTools.includes(WorkspaceTool.LINK) && (
      <Button
        type="ghost"
        size="small"
        title="Link alt/option"
        onClick={() => onToolChange(WorkspaceTool.LINK)}
        disabled={tool === WorkspaceTool.LINK}
      >
        <Icon type="Link" />
      </Button>
    )}
    {areKeyboardShortcutsEnabled && (
      <KeyboardShortcut
        keys="alt"
        onKeyDown={() => onToolChange(WorkspaceTool.LINK)}
        onKeyRelease={() => onToolChange(WorkspaceTool.MOVE)}
      />
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
