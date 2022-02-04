import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { AnnotationIcon, DrawingIcon } from 'components/CustomIcons';
import { WorkspaceTool } from 'components/LineReviewViewer/useWorkspaceTools';
import { useState } from 'react';

import KeyboardShortcut from '../KeyboardShortcut/KeyboardShortcut';

import { ToolboxSeparator, WorkSpaceToolsWrapper } from './elements';

enum NodeSelector {
  ANNOTATIONS = '.annotation',
  DRAWINGS = '.drawing',
}

type WorkSpaceToolsProps = {
  tool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  enabledTools?: WorkspaceTool[];
  ornateRef?: CogniteOrnate;
  areKeyboardShortcutsEnabled: boolean;
};

const DEFAULT_LAYER_STYLE = {
  marginRight: 16,
  filter: '',
  opacity: 1,
};
const HIDDEN_LAYER_STYLE = {
  filter: 'grayscale(1)',
  opacity: 0.66,
};

const WorkSpaceTools = ({
  tool,
  onToolChange,
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
  ornateRef,
  areKeyboardShortcutsEnabled,
}: WorkSpaceToolsProps) => {
  const [layerStatus, setLayerStatus] = useState<Record<NodeSelector, boolean>>(
    {
      [NodeSelector.ANNOTATIONS]: true,
      [NodeSelector.DRAWINGS]: true,
    }
  );

  const onSetLayerVisibility = (
    layerModifier: NodeSelector,
    visible: boolean
  ) => {
    (ornateRef?.stage.find(layerModifier) ?? []).forEach((shape) => {
      if (visible) {
        shape.show();
      } else {
        shape.hide();
      }
    });
  };

  const onToggleLayer = (layer: NodeSelector) => {
    onSetLayerVisibility(layer, !layerStatus[layer]);
    setLayerStatus((prev) => ({
      ...prev,
      [layer]: !layerStatus[layer],
    }));
  };

  return (
    <WorkSpaceToolsWrapper>
      {enabledTools.includes(WorkspaceTool.LAYERS) && (
        <>
          <Dropdown
            content={
              <Menu>
                <Menu.Header>Click to turn on / off</Menu.Header>
                <Menu.Item
                  onClick={() => onToggleLayer(NodeSelector.ANNOTATIONS)}
                  style={{
                    ...DEFAULT_LAYER_STYLE,
                    ...(layerStatus[NodeSelector.ANNOTATIONS]
                      ? HIDDEN_LAYER_STYLE
                      : {}),
                  }}
                >
                  <AnnotationIcon style={{ marginRight: 8 }} />
                  lineReviews
                </Menu.Item>
                <Menu.Item
                  onClick={() => onToggleLayer(NodeSelector.DRAWINGS)}
                  style={{
                    ...DEFAULT_LAYER_STYLE,
                    ...(layerStatus[NodeSelector.DRAWINGS]
                      ? HIDDEN_LAYER_STYLE
                      : {}),
                  }}
                >
                  <DrawingIcon style={{ marginRight: 8 }} />
                  Drawings
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
};

export default WorkSpaceTools;
